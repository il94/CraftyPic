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
	const RETYPE_PASSWORD_ERROR = "RETYPE_PASSWORD";

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

		$_SESSION['logged_in'] = true;
	}

	// Crée un compte
	public function signup($email, $username, $password, $reTypePassword) {
		$this->parseEmail($email);
		$this->parseUsername($username);
		$this->parsePassword($password, $reTypePassword);

		$userFound = !!$this->repository->findUserByUsername($username);
		if ($userFound)
			throw new HttpException("Username already taken", 403, self::USERNAME_ERROR);

		$userDatas = [
			'email' => $email,
			'username' => $username,
			'password' => password_hash($password, PASSWORD_DEFAULT),
			'avatar' => DEFAULT_AVATAR,
			'role' => DEFAULT_ROLE,
			'activation_token' => $this->getRandomToken() 
		];

		$this->repository->createUser($userDatas);
		
		$this->sendConfirmationEmail($userDatas);
	}

	// Active un compte
	public function activateAccount($token) {
		$userFound = $this->repository->findUserByActivationToken($token);
		if (!$userFound)
			throw new HttpException("User not found", 404, '');

		$this->repository->activateUser($userFound->id);
	}

	// Déconnecte un compte
	public function logout() {
		session_destroy();
	}

	/* ==================== UTILS ==================== */

	// Verifie si la string est un email valide
	private function parseLogin($login) {
		if (empty($login))
			throw new HttpException("Email or username is required", 400, self::LOGIN_ERROR);
	}

	// Verifie si la string est un email valide
	private function parseEmail($email) {
		if (empty($email))
			throw new HttpException("Email is required", 400, self::EMAIL_ERROR);
		if (!filter_var($email, FILTER_VALIDATE_EMAIL))
			throw new HttpException("Invalid email format", 422, self::EMAIL_ERROR);
	}

	// Verifie si la string est un username valide
	private function parseUsername($username) {
		if (empty($username))
			throw new HttpException("Username is required", 400, self::USERNAME_ERROR);
		if (strlen($username) > self::MAX_USERNAMENAME_LENGTH)
			throw new HttpException("Username exceeds maximum length of " . self::USERNAME_ERROR . " characters", 422, self::USERNAME_ERROR);
	}

	// Verifie si la string est un password valide
	private function parsePassword($password, $reTypePassword) {
		if (empty($password))
			throw new HttpException("Password is required", 400, self::PASSWORD_ERROR);
		if ($reTypePassword) {
			if (strlen($password) < self::MIN_PASSWORD_LENGTH)
				throw new HttpException("Password must be at least " . self::MIN_PASSWORD_LENGTH . " characters long", 422, self::PASSWORD_ERROR);
			if (!preg_match("/[A-Z]/", $password))
				throw new HttpException("Password must contain at least one uppercase letter", 422, self::PASSWORD_ERROR);
			if (!preg_match("/[a-z]/", $password))
				throw new HttpException("Password must contain at least one lowercase letter", 422, self::PASSWORD_ERROR);
			if (!preg_match("/[0-9]/", $password))
				throw new HttpException("Password must contain at least one digit", 422, self::PASSWORD_ERROR);
			if (!preg_match("/[\W_]/", $password))
				throw new HttpException("Password must contain at least one special character", 422, self::PASSWORD_ERROR);
		}
	}

	// Retourne un token aléatoire
	private function getRandomToken(): string {
		return hash("sha256", bin2hex(random_bytes(16)));
	}

	// Envoie un email de confirmation de création de compte
	private function sendConfirmationEmail($userDatas) {
		$headers = "From: noreply@craftypic.com\r\n";
		$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
		$subject = 'Confirmation of your CraftyPic account';
		$activationLink = 'http://localhost:8080/index.php?page=auth&route=signup&token=' . urlencode($userDatas['activation_token']);
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
					<li><strong>Username:</strong> ' . htmlspecialchars($userDatas['username']) . '</li>
					<li><strong>Email:</strong> ' . htmlspecialchars($userDatas['email']) . '</li>
				</ul>
				<p>Please click the following link to activate your account:</p>
				<p><a href="' . $activationLink . '">Activate Account</a></p>
				<p>We look forward to seeing you on CraftyPic!</p>
				<br>
				<p><em>If you did not create an account on CraftyPic, please disregard this message.</em></p>
			</body>
			</html>
			';
			
		mail($userDatas['email'], $subject, $message, $headers);
	}
}