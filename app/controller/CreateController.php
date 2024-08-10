<?php

require_once('model/create.php');

class CreateController {

	public CreateService $service;

	public function __construct() {
		$this->service = new CreateService();
	}

	public function createPics($userId, $image, $stickersData) {
		try {
			// $data = json_decode(file_get_contents('php://input'));
			// $imageUrl = $data->imageUrl;
			// $stickers = $data->stickers;
			$dataPics = new stdClass();
			$dataPics->image = $image;
			$dataPics->stickersData = $stickersData;
			$this->service->createPics($userId, $dataPics);
			http_response_code(201);
			// echo json_encode($response);
		}
		catch (HttpException $error) {
			http_response_code($error->getCode());

			$response = new stdClass();
			$response->message = $error->getMessage();
			$response->field = $error->getField();

			echo json_encode($response);
		}
	}

	public function get($state, $id) {

		$headers = require_once("view/layouts/create_assets.php");
		$user = $this->service->authService->getUserAuth($_SESSION['logged_in']);

		if ($state) {
		}
		else {
			$body = require_once('view/create.php');
		}

		$scripts = require_once("view/layouts/create_scripts.php");

		require_once('view/layout.php');
	}

}