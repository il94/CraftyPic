<?php

class HomeService {
	public HomeRepository $repository;
	public AuthService $authService;

	public function __construct() {
		$this->repository = new HomeRepository();
		$this->authService = new AuthService();
	}

	public function createComment($userId, $picId, $content, $contentSize) {
		if (strlen($contentSize) < 1 || strlen($contentSize) > 255)
			throw new HttpException("Bad request", 400, "");

		$picFound = $this->repository->findPicById($picId);
		if (!$picFound)
			throw new HttpException("Pic not found", 404, '');

		$this->repository->createComment($userId, $picId, $content);

		$userTarget = $this->authService->repository->findUserByPicIdSecure($picId);
		if ($userTarget->notification_comment) {
			$userAuth = $this->authService->repository->findUserByIdSecure($userId);
			$this->sendCommentNotif($userAuth, $userTarget);
		}
	}

	public function likePic($userId, $picId): int {
		$picFound = $this->repository->findPicById($picId);
		if (!$picFound)
			throw new HttpException("Pic not found", 404, '');

		if ($this->repository->hasLikedPic($userId, $picId)) {
			$this->repository->unlikePic($userId, $picId);
			return (200);
		}
		else {
			$this->repository->likePic($userId, $picId);

			$userTarget = $this->authService->repository->findUserByPicIdSecure($picId);
			if ($userTarget->notification_like) {
				$userAuth = $this->authService->repository->findUserByIdSecure($userId);
				$this->sendLikeNotif($userAuth, $userTarget);
			}

			return (201);
		}
	}

	// Verifie si un user a like une pic
	public function hasLikedPic($userId, $picId) {
		return $this->repository->hasLikedPic($userId, $picId);
	}

	// Retounr le nombre de commentaires d'une pic
	public function getCountComments($picId) {
		return $this->repository->getCountComments($picId);
	}

	// Retounr le nombre de likes d'une pic
	public function getCountLikes($picId) {
		return $this->repository->getCountLikes($picId);
	}

	// Retourne 5 pics
	public function getPics($userId, $cursor) {
	
		if ($cursor !== NULL)
			$picDatas = $this->repository->getPicsWithCursor($cursor);
		else
			$picDatas = $this->repository->getLastFivePics();

		$pics = [];
		foreach ($picDatas as $picData) {
			$user = User::withParams(
				$picData->userId,
				$picData->author,
				$picData->author_avatar
			);

			$picData->likesCount = $this->getCountLikes($picData->id);
			$picData->liked = !!$this->hasLikedPic($userId, $picData->id);
			$picData->commentsCount = $this->getCountComments($picData->id);

			$pic = Pic::withParams(
				$picData->id,
				$picData->image,
				$picData->likesCount,
				$picData->liked,
				$user,
				$picData->commentsCount,
			);

			$pics[] = $pic;
		}
	
		return ($pics);
	}

	// Retourne 10 comments d'une pic
	public function getComments($picId, $cursor) {
		if ($cursor !== NULL)
			$commentsDatas = $this->repository->getCommentsWithCursor($picId, $cursor);
		else
			$commentsDatas = $this->repository->getLastTwentyComments($picId);

		$comments = [];
		foreach ($commentsDatas as $commentData) {

			$user = User::withParams(
				$commentData->userId,
				$commentData->author,
				$commentData->author_avatar
			);

			$comments[] = Comment::withParams(
				$commentData->id,
				$commentData->content,
				$user
			);
		}

		return ($comments);
	}

	// Supprime une pic
	public function deletePic($userId, $picId) {
		$picFound = $this->repository->findPicById($picId);
		if (!$picFound)
			throw new HttpException("Pic not found", 404, '');

		$user = $this->authService->repository->findUserByPicIdSecure($picId);

		if ($user->id === $userId)
			$this->authService->repository->deletePic($picId);
		else
			throw new HttpException("Bad request", 400, "");
	}

	// Envoie un email de notification de like
	public function sendLikeNotif($userAuth, $userTarget) {
		$headers = "From: noreply@craftypic.com\r\n";
		$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
		$subject = 'Someone liked your pic !';
		$homeLink = $_ENV['URL'];
		$message = '
			<html>
			<head>
				<title>Photo Like Notification</title>
			</head>
			<body>
				<p>Dear ' . htmlspecialchars($userTarget->username) . ',</p>
				<p>We wanted to let you know that ' . htmlspecialchars($userAuth->username) . ' has liked your pic !</p>
				<p>We hope you continue to enjoy sharing your photos on CraftyPic!</p>
				<p><a href="' . $homeLink . '">CraftyPic</a></p>
			</body>
			</html>
		';
			
		mail($userTarget->email, $subject, $message, $headers);
	}

	// Envoie un email de notification de comment
	public function sendCommentNotif($userAuth, $userTarget) {
		$headers = "From: noreply@craftypic.com\r\n";
		$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
		$subject = 'Someone commented your pic !';
		$homeLink = $_ENV['URL'];
		$message = '
			<html>
			<head>
				<title>Photo Comment Notification</title>
			</head>
			<body>
				<p>Dear ' . htmlspecialchars($userTarget->username) . ',</p>
				<p>We wanted to let you know that ' . htmlspecialchars($userAuth->username) . ' has commented your pic !</p>
				<p>We hope you continue to enjoy sharing your photos on CraftyPic!</p>
				<p><a href="' . $homeLink . '">CraftyPic</a></p>
			</body>
			</html>
		';
			
		mail($userTarget->email, $subject, $message, $headers);
	}
}