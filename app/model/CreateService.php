<?php

class CreateService {
	public CreateRepository $repository;
	public AuthService $authService;

	public function __construct() {
		$this->repository = new CreateRepository();
		$this->authService = new AuthService();
	}

	/* ==================== ROUTES ==================== */

	// Crée une pic
	public function createPics($userId, $dataPics) {
		$user = $this->authService->repository->findUserById($userId);
		if (!$user)
			throw new HttpException("User not found", 404, '');


		$uploadedFiles = [];

		prettyPrint($dataPics);

		foreach ($dataPics as $dataPic) {
			// if ($file['error'] !== UPLOAD_ERR_OK)
			// 	return //error



			// $image = imagecreatefrompng($uploadedFile);

			// foreach ($stickers as $file->sticker) {
			// 	if (!isset($sticker->src, $sticker->width, $sticker->height, $sticker->left, $sticker->top)) {
			// 		continue;
			// 	}
			
			// 	$stickerPath = STICKERS_PATH . basename($sticker->src);
			
			// 	$stickerData = file_get_contents($stickerPath);
			// 	if ($stickerData === false) {
			// 		die('Impossible de lire le fichier sticker : ' . $stickerPath);
			// 	}
			
			// 	$stickerImage = imagecreatefromstring($stickerData);
			// 	if ($stickerImage === false) {
			// 		die('Impossible de créer le sticker à partir du PNG.');
			// 	}

			// 	imagealphablending($image, true);
			// 	imagesavealpha($image, true);

			// 	imagecopyresampled(
			// 		$image,
			// 		$stickerImage,
			// 		(int) $sticker->left,
			// 		(int) $sticker->top,
			// 		0,
			// 		0,
			// 		(int) $sticker->width,
			// 		(int) $sticker->height,
			// 		imagesx($stickerImage),
			// 		imagesy($stickerImage)
			// 	);
				
			// 	imagedestroy($stickerImage);
			// }






















			
				// // Déplacer le fichier vers le répertoire de destination
				// $picName = uniqid() . '.png';
				// $uploadedFile = UPLOAD_ABSOLUTE_PATH . $picName;
				
				// $picPath = UPLOAD_RELATIVE_PATH . $picName;

				// if (move_uploaded_file($file['tmp_name'], $uploadedFile)) {
				// 	$uploadedFiles[$key] = $uploadedFile;
				// 	$picDatas = new stdClass();
			
				// 	$picDatas->userId = $userId;
				// 	$picDatas->image = $picPath;
			
				// 	$this->repository->createPic($picDatas);
				// } else {
				// 	// Gestion des erreurs
				// 	echo "Failed to move uploaded file: " . $file['name'];
				// }
			// }
		}








		// $imageData = str_replace('data:image/png;base64,', '', $imageData);
		// $imageData = base64_decode($imageData);

		// $image = imagecreatefromstring($imageData);
		// if ($image === false) {
		// 	die('Impossible de créer l\'image.');
		// }

		// foreach ($stickers as $sticker) {
		// 	if (!isset($sticker->src, $sticker->width, $sticker->height, $sticker->left, $sticker->top)) {
		// 		continue;
		// 	}
		
		// 	$stickerPath = STICKERS_PATH . basename($sticker->src);
		
		// 	$stickerData = file_get_contents($stickerPath);
		// 	if ($stickerData === false) {
		// 		die('Impossible de lire le fichier sticker : ' . $stickerPath);
		// 	}
		
		// 	$stickerImage = imagecreatefromstring($stickerData);
		// 	if ($stickerImage === false) {
		// 		die('Impossible de créer le sticker à partir du PNG.');
		// 	}

		// 	imagealphablending($image, true);
		// 	imagesavealpha($image, true);

		// 	imagecopyresampled(
		// 		$image,
		// 		$stickerImage,
		// 		(int) $sticker->left,
		// 		(int) $sticker->top,
		// 		0,
		// 		0,
		// 		(int) $sticker->width,
		// 		(int) $sticker->height,
		// 		imagesx($stickerImage),
		// 		imagesy($stickerImage)
		// 	);
			
		// 	imagedestroy($stickerImage);
		// }
	
		// $picName = uniqid() . '.png';
		// $picPath = UPLOAD_RELATIVE_PATH . $picName;

		// imagepng($image, UPLOAD_ABSOLUTE_PATH . $picName);
		// imagedestroy($image);

		// $picDatas = new stdClass();

		// $picDatas->userId = $userId;
		// $picDatas->image = $picPath;

		// $this->repository->createPic($picDatas);

		// return $picPath;
	}













	// // Crée une pic
	// public function createPics($userId, $imageData, $stickers) {
	// 	$user = $this->authService->repository->findUserById($userId);
	// 	if (!$user)
	// 		throw new HttpException("User not found", 404, '');

	// 	$imageData = str_replace('data:image/png;base64,', '', $imageData);
	// 	$imageData = base64_decode($imageData);

	// 	$image = imagecreatefromstring($imageData);
	// 	if ($image === false) {
	// 		die('Impossible de créer l\'image.');
	// 	}

	// 	foreach ($stickers as $sticker) {
	// 		if (!isset($sticker->src, $sticker->width, $sticker->height, $sticker->left, $sticker->top)) {
	// 			continue;
	// 		}
		
	// 		$stickerPath = STICKERS_PATH . basename($sticker->src);
		
	// 		$stickerData = file_get_contents($stickerPath);
	// 		if ($stickerData === false) {
	// 			die('Impossible de lire le fichier sticker : ' . $stickerPath);
	// 		}
		
	// 		$stickerImage = imagecreatefromstring($stickerData);
	// 		if ($stickerImage === false) {
	// 			die('Impossible de créer le sticker à partir du PNG.');
	// 		}

	// 		imagealphablending($image, true);
	// 		imagesavealpha($image, true);

	// 		imagecopyresampled(
	// 			$image,
	// 			$stickerImage,
	// 			(int) $sticker->left,
	// 			(int) $sticker->top,
	// 			0,
	// 			0,
	// 			(int) $sticker->width,
	// 			(int) $sticker->height,
	// 			imagesx($stickerImage),
	// 			imagesy($stickerImage)
	// 		);
			
	// 		imagedestroy($stickerImage);
	// 	}
	
	// 	$picName = uniqid() . '.png';
	// 	$picPath = UPLOAD_RELATIVE_PATH . $picName;

	// 	imagepng($image, UPLOAD_ABSOLUTE_PATH . $picName);
	// 	imagedestroy($image);

	// 	$picDatas = new stdClass();

	// 	$picDatas->userId = $userId;
	// 	$picDatas->image = $picPath;

	// 	$this->repository->createPic($picDatas);

	// 	return $picPath;
	// }

}