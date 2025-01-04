<?php

require_once("lib/HttpException.php");

class AuthService {
	public AuthRepository $repository;

	// CONSTANTES
	const MAX_USERNAMENAME_LENGTH = 20;
	const MIN_PASSWORD_LENGTH = 8;

	const LOGIN_ERROR = "LOGIN";
	const USERNAME_ERROR = "USERNAME";
	const EMAIL_ERROR = "EMAIL";
	const PASSWORD_ERROR = "PASSWORD";
	const NEW_PASSWORD_ERROR = "NEW_PASSWORD";
	const RETYPE_PASSWORD_ERROR = "RETYPE_PASSWORD";
	const AVATAR_ERROR = "AVATAR";

	public function __construct() {
		$this->repository = new AuthRepository();
	}

	/* ==================== ROUTES ==================== */

	// Connecte un compte
	public function login($login, $password) {
		$this->parseLogin($login);
		$this->parsePassword($password, null);

		if (filter_var($login, FILTER_VALIDATE_EMAIL))
			$userDatas = $this->repository->findUserByEmail($login);
		else
			$userDatas = $this->repository->findUserByUsername($login);

		if (empty($userDatas) || !password_verify($password, $userDatas->password))
			throw new HttpException("Incorrect password", 403, self::PASSWORD_ERROR);
		else if (!$userDatas->active)
			throw new HttpException("You have to activate your account", 403, self::PASSWORD_ERROR);

		session_regenerate_id(true);
		$_SESSION['logged_in'] = $userDatas->id;
	}

	// Envoie un mail de recuperation de mot de passe
	public function forgotPassword($login) {
		$this->parseLogin($login);

		if (filter_var($login, FILTER_VALIDATE_EMAIL))
			$userFound = $this->repository->findUserByEmail($login);
		else
			$userFound = $this->repository->findUserByUsername($login);

		if (empty($userFound))
			throw new HttpException("User not found", 404, self::LOGIN_ERROR);

		$userDatas = new stdClass();
		$userDatas->id = $userFound->id;
		$userDatas->email = $userFound->email;
		$userDatas->reset_password_token = $this->getRandomToken();
		$userDatas->reset_password_token_expires_at = $this->getExpiresDate(null);
	
		$this->repository->updateUserResetPasswordToken($userDatas);
		$this->repository->updateUserResetPasswordTokenExpiresAt($userDatas);
		$this->sendResetPasswordEmail($userDatas);
	}

	// Reinitialise un mot de passe
	public function reinitialization($password, $reTypePassword, $token) {
		$this->parsePassword($password, $reTypePassword);

		$userFound = $this->repository->findUserByResetPasswordToken($token);
		if (!$userFound)
			throw new HttpException("User not found", 404, '');

		$userDatas = new stdClass();
		$userDatas->id = $userFound->id;
		$userDatas->reset_password_token = null;
		$userDatas->reset_password_token_expires_at = null;
		
		$this->repository->updateUserResetPasswordToken($userDatas);
		$this->repository->updateUserResetPasswordTokenExpiresAt($userDatas);	

		$expiresAt = new DateTime($userFound->reset_password_token_expires_at);
		$now = new DateTime();

		if ($now > $expiresAt)
			throw new HttpException("The link you used has expired. Please request a new one to proceed.", 403, "");

		$userDatas->password = password_hash($password, PASSWORD_DEFAULT);

		$this->repository->updateUserPassword($userDatas);
	}	

	// Crée un compte
	public function signup($email, $username, $password, $reTypePassword) {
		$this->parseEmail($email);
		$this->parseUsername($username);
		$this->parsePassword($password, $reTypePassword);

		$userFound = !!$this->repository->findUserByEmail($email);
		if ($userFound)
			throw new HttpException("Email already taken", 403, self::EMAIL_ERROR);

		$userFound = !!$this->repository->findUserByUsername($username);
		if ($userFound)
			throw new HttpException("Username already taken", 403, self::USERNAME_ERROR);

		$userDatas = new stdClass();
		$userDatas->email = $email;
		$userDatas->username = $username;
		$userDatas->password = password_hash($password, PASSWORD_DEFAULT);
		$userDatas->avatar = DEFAULT_AVATAR;
		$userDatas->role = DEFAULT_ROLE;
		$userDatas->notification_like = true;
		$userDatas->notification_comment = true;
		$userDatas->activation_token = $this->getRandomToken();
		$userDatas->activation_token_expires_at = $this->getExpiresDate('activation');
		$userDatas->active = false;
		$userDatas->reset_password_token = null;
		$userDatas->update_email_token = null;

		$this->repository->createUser($userDatas);
		
		$this->sendConfirmationEmail($userDatas);
	}

	// Update un user
	public function update($userId, $datas, $files) {

		$user = $this->repository->findUserById($userId);

		if (!$user)
			throw new HttpException("User not found", 404, '');

		$userDatas = new stdClass();
		$userDatas->id = $userId;

		if (array_key_exists('email', $datas)) {
			
			if ($user->email === $datas['email'])
				throw new HttpException("This email is already linked to your account", 403, self::EMAIL_ERROR);

			$userFound = !!$this->repository->findUserByEmail($datas['email']);
			if ($userFound)
				throw new HttpException("Email already taken", 403, self::EMAIL_ERROR);
	
			$this->parseEmail($datas['email']);
			$userDatas->email = $datas['email'];
			$userDatas->username = $user->username;
			$userDatas->update_email_token = $this->getRandomToken();
			$userDatas->update_email_token_expires_at = $this->getExpiresDate(null);

			$this->repository->updateUserUpdateEmailToken($userDatas);
			$this->repository->updateUserUpdateEmailTokenExpiresAt($userDatas);
			$this->sendUpdateEmailEmail($userDatas);

			return "/settings/update_start";
		}
		else if (array_key_exists('username', $datas)) {

			$userFound = !!$this->repository->findUserByUsername($datas['username']);
			if ($userFound)
				throw new HttpException("Username already taken", 403, self::USERNAME_ERROR);
	
			$this->parseUsername($datas['username']);
			$userDatas->username = $datas['username'];
			$this->repository->updateUserUsername($userDatas);

			return "/settings/updated";
		}
		else if (array_key_exists('currentpassword', $datas)) {

			if (!password_verify($datas['currentpassword'], $user->password))
				throw new HttpException("Incorrect password", 403, $this::PASSWORD_ERROR);

			try {
				$this->parsePassword($datas['newpassword'], $datas['retypenewpassword']);
			}
			catch (HttpException $error) {
				if ($error->getField() === $this::PASSWORD_ERROR)
					throw new HttpException($error->getMessage(), 422, $this::NEW_PASSWORD_ERROR);
				throw $error;
			}

			$userDatas->password = password_hash($datas['newpassword'], PASSWORD_DEFAULT);
			$this->repository->updateUserPassword($userDatas);

			session_destroy();
			return "/login";
		}
		else if (array_key_exists('avatar', $files)) {

			if (count($files) !== 1)
				throw new HttpException("Invalid avatar", 400, self::AVATAR_ERROR);

			sanitizeFile($files['avatar']);

			$avatarName = uniqid() . '.png';
			$avatarPath = UPLOAD_RELATIVE_PATH . $avatarName;
			if (!move_uploaded_file($files['avatar']['tmp_name'], UPLOAD_ABSOLUTE_PATH . $avatarName))
				throw new HttpException("Invalid avatar", 400, self::AVATAR_ERROR);

			$userDatas->avatar = $avatarPath;
			$this->repository->updateUserAvatar($userDatas);

			return "/settings/updated";
		}
		else if (array_key_exists('notification_like', $datas)) {

			$this->parseNotif($datas['notification_like']);
			$userDatas->notification_like = $datas['notification_like'];
			$this->repository->updateUserNotificationLike($userDatas);

			return null;
		}
		else if (array_key_exists('notification_comment', $datas)) {

			$this->parseNotif($datas['notification_comment']);
			$userDatas->notification_comment = $datas['notification_comment'];
			$this->repository->updateUserNotificationComment($userDatas);

			return null;
		}
		else
			return null;
	}

	// Update l'email du user
	public function updateEmail($newEmail, $token) {
		$userFound = !!$this->repository->findUserByEmail($newEmail);
		if ($userFound)
			throw new HttpException("Bad request", 400, "");

		$userFound = $this->repository->findUserByUpdateEmailToken($token);
		if (!$userFound)
			throw new HttpException("User not found", 404, '');

		$userDatas = new stdClass();
		$userDatas->id = $userFound->id;
		$userDatas->update_email_token = null;
		$userDatas->update_email_token_expires_at = null;

		$this->repository->updateUserUpdateEmailToken($userDatas);
		$this->repository->updateUserUpdateEmailTokenExpiresAt($userDatas);

		$expiresAt = new DateTime($userFound->update_email_token_expires_at);
		$now = new DateTime();
	
		if ($now > $expiresAt)
			throw new HttpException("The link you used has expired. Please request a new one to proceed.", 403, "");

		$userDatas->email = $newEmail;
		$this->repository->updateUserEmail($userDatas);

		session_destroy();
	}

	// Active un compte
	public function activateAccount($token) {
		$userFound = $this->repository->findUserByActivationToken($token);
		if (!$userFound)
			throw new HttpException("User not found", 404, '');

		$expiresAt = new DateTime($userFound->activation_token_expires_at);
		$now = new DateTime();
		
		if ($now > $expiresAt) {
			$this->repository->deleteUser($userFound->id);
			throw new HttpException("The link you used has expired. Please request a new one to proceed.", 403, "");
		}

		$userDatas = new stdClass();
		$userDatas->id = $userFound->id;
		$userDatas->active = true;
		$userDatas->activation_token = null;
		$userDatas->activation_token_expires_at = null;

		$this->repository->updateUserActive($userDatas);
		$this->repository->updateUserActivationToken($userDatas);
		$this->repository->updateUserActivationTokenExpiresAt($userDatas);
	}

	// Déconnecte un compte
	public function logout() {
		session_destroy();
	}

	// Retourne le user authentifie
	public function getUserAuth($userId) {
		return $this->repository->findUserByIdSecure($userId);
	}

	/* ==================== UTILS ==================== */

	// Verifie si la string est un email valide
	public function parseLogin($login) {
		if (empty($login))
			throw new HttpException("Email or username is required", 403, self::LOGIN_ERROR);
	}

	// Verifie si la string est un email valide
	public function parseEmail($email) {
		if (empty($email))
			throw new HttpException("Email is required", 403, self::EMAIL_ERROR);
		if (!filter_var($email, FILTER_VALIDATE_EMAIL))
			throw new HttpException("Invalid email format", 422, self::EMAIL_ERROR);
	}

	// Verifie si la string est un username valide
	public function parseUsername($username) {
		if (empty($username))
			throw new HttpException("Username is required", 403, self::USERNAME_ERROR);
		if (strlen($username) > self::MAX_USERNAMENAME_LENGTH)
			throw new HttpException("Username exceeds maximum length of " . self::MAX_USERNAMENAME_LENGTH . " characters", 422, self::USERNAME_ERROR);
	}

	// Verifie si la string est un password valide
	public function parsePassword($password, $reTypePassword) {
		if (empty($password))
			throw new HttpException("Password is required", 403, self::PASSWORD_ERROR);
		if (strlen($password) < self::MIN_PASSWORD_LENGTH)
			throw new HttpException("Password must be at least " . self::MIN_PASSWORD_LENGTH . " characters long", 422, self::PASSWORD_ERROR);
		if (!preg_match("/[A-Z]/", $password))
			throw new HttpException("Password must contain at least one uppercase letter", 422, self::PASSWORD_ERROR);
		if (!preg_match("/[a-z]/", $password))
			throw new HttpException("Password must contain at least one lowercase letter", 422, self::PASSWORD_ERROR);
		if (!preg_match("/[0-9]/", $password))
			throw new HttpException("Password must contain at least one digit", 422, self::PASSWORD_ERROR);
		if ($reTypePassword !== null && $password !== $reTypePassword) {
			throw new HttpException("New password does not match. Enter new password again here.", 422, self::RETYPE_PASSWORD_ERROR);
		}
	}

	// Verifie si la string est un booleen
	public function parseNotif($notif) {
		if ($notif != '0' && $notif != '1')
			throw new HttpException("Bool is required", 400, '');
	}

    // Retourne un token basé sur un email
    public function getEmailToken(string $email): string {
        return hash("sha256", $email);
    }

	// Retourne un token aléatoire
	public function getRandomToken(): string {
		return hash("sha256", bin2hex(random_bytes(16)));
	}

	// Retourne une date d'expiration
	public function getExpiresDate($token): string {
		if ($token === "activation")
			return (new DateTime())->modify('+1 day')->format('Y-m-d H:i:s');
		return (new DateTime())->modify('+1 hour')->format('Y-m-d H:i:s');
	}

	// Envoie un email de confirmation de création de compte
	public function sendConfirmationEmail($userDatas) {
		$headers = "From: noreply@craftypic.com\r\n";
		$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
		$subject = 'Confirmation of your CraftyPic account';
		$activationLink = $_ENV['URL'] . '/signup?token=' . urlencode($userDatas->activation_token);
		$message = '
			<html>
			<head>
				<title>Confirmation of CraftyPic Account</title>
			</head>
			<body>
				<p>Dear User,</p>
				<p>Thank you for registering with CraftyPic! Your account has been successfully created.</p>
				<p>Here are your account details:</p>
				<ul>
					<li><strong>Username:</strong> ' . htmlspecialchars($userDatas->username) . '</li>
					<li><strong>Email:</strong> ' . htmlspecialchars($userDatas->email) . '</li>
				</ul>
				<p>Please click the following link to activate your account:</p>
				<p><a href="' . $activationLink . '">Activate Account</a></p>
				<p>We look forward to seeing you on CraftyPic!</p>
				<br>
				<p><em>If you did not create an account on CraftyPic, please disregard this message.</em></p>
			</body>
			</html>
			';
			
		mail($userDatas->email, $subject, $message, $headers);
	}

	// Envoie un email de recuperation de mot de passe
	public function sendResetPasswordEmail($userDatas) {
		$headers = "From: noreply@craftypic.com\r\n";
		$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
		$subject = 'Reset your CraftyPic password';
		$resetLink = $_ENV['URL'] . '/login/reinitialization?token=' . urlencode($userDatas->reset_password_token);
		$message = '
			<html>
			<head>
				<title>Reset Your CraftyPic Password</title>
			</head>
			<body>
				<p>Dear User,</p>
				<p>We received a request to reset your password for your CraftyPic account.</p>
				<p>Please click the following link to reset your password:</p>
				<p><a href="' . $resetLink . '">Reset Password</a></p>
				<p>If you did not request a password reset, please disregard this email or contact our support if you have questions.</p>
				<br>
				<p>Thank you,</p>
				<p>The CraftyPic Team</p>
			</body>
			</html>
		';
			
		mail($userDatas->email, $subject, $message, $headers);
	}

	// Envoie un email de confirmation de création de compte
	public function sendUpdateEmailEmail($userDatas) {
		$headers = "From: noreply@craftypic.com\r\n";
		$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
		$subject = 'Confirm your new email address for CraftyPic';
		$updateLink = $_ENV['URL'] . '/settings?email=' . urlencode($userDatas->email) . '&token=' . urlencode($userDatas->update_email_token);
		$message = '
			<html>
			<head>
				<title>Confirm your new email address</title>
			</head>
			<body>
				<p>Dear ' . htmlspecialchars($userDatas->username) . ',</p>
				<p>You recently requested to update the email address associated with your CraftyPic account.</p>
				<p>To confirm your new email address (' . htmlspecialchars($userDatas->email) . '), please click the link below:</p>
				<p><a href="' . $updateLink . '">Confirm Email Address</a></p>
				<p>If you did not request this change, please ignore this email or contact our support team.</p>
				<br>
				<p>Thank you,</p>
				<p>The CraftyPic Team</p>
			</body>
			</html>
		';
		
		mail($userDatas->email, $subject, $message, $headers);
	}

}