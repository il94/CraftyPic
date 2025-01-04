<?php

require_once('model/auth.php');

class AuthController
{
	public AuthService $service;

	public function __construct() {
		$this->service = new AuthService();
	}

	public function login($login, $password) {
		try {
			$this->service->login($login, $password);
			http_response_code(201);
			header("Location: /");
			exit();
		}
		catch (HttpException $error) {
			http_response_code($error->getCode());

			$response = new stdClass();
			$response->message = $error->getMessage();
			$response->field = $error->getField();

			echo json_encode($response);
		}
	}

	public function forgotPassword($login) {
		try {
			$this->service->forgotPassword($login);
			
			http_response_code(201);
			header("Location: /login/reinitialization-start");
			exit();
		}
		catch (HttpException $error) {
			http_response_code($error->getCode());

			$response = new stdClass();
			$response->message = $error->getMessage();
			$response->field = $error->getField();

			echo json_encode($response);
		}
	}

	public function reinitialization($password, $reTypePassword, $token) {
		try {
			$this->service->reinitialization($password, $reTypePassword, $token);

			http_response_code(201);
			header("Location: /login");
			exit();
		}
		catch (HttpException $error) {
			error($error->getMessage(), $error->getCode());
		}
	}

	public function signup($email, $username, $password, $reTypePassword) {
		try {
			$this->service->signup($email, $username, $password, $reTypePassword);

			http_response_code(201);
			header("Location: /signup/activation");
			exit();
		}
		catch (HttpException $error) {
			http_response_code($error->getCode());

			$response = new stdClass();
			$response->message = $error->getMessage();
			$response->field = $error->getField();

			echo json_encode($response);
		}
	}

	public function update($userId, $datas, $files) {
		try {
			$redirect = $this->service->update($userId, $datas, $files);

			http_response_code(200);
			if ($redirect) {
				header("Location: " . $redirect);
				exit();
			}
		}
		catch (HttpException $error) {
			http_response_code($error->getCode());

			$response = new stdClass();
			$response->message = $error->getMessage();
			$response->field = $error->getField();

			echo json_encode($response);
		}
	}

	public function activateAccount($token) {
		try {
			$this->service->activateAccount($token);
			$this->getSignup("activate", null);

			http_response_code(200);
		}
		catch (HttpException $error) {
			error($error->getMessage(), $error->getCode());
		}
	}

	public function logout() {
		try {
			$this->service->logout();

			http_response_code(200);
			header("Location: /login");
			exit();
		}
		catch (HttpException $error) {
			http_response_code($error->getCode());

			$response = new stdClass();
			$response->message = $error->getMessage();
			$response->field = $error->getField();

			echo json_encode($response);
		}
		finally {
			session_destroy();
		}
	}

	public function getLogin($state) {

		$header = require_once('view/layouts/auth_assets.php');

		if ($state) {
			if ($state === "forgot-password")
				$body = require_once('view/auth_forgot_password.php');
			else if ($state === "reinitialization-start")
				$body = require_once('view/auth_reinitialization_start.php');
			else if ($state === "reinitialization")
				$body = require_once('view/auth_reinitialization.php');
			else if ($state === "reinitialized")
				$body = require_once('view/auth_reinitialized.php');
			else if ($state === "updated")
				$body = require_once('view/auth_updated.php');
			else if ($state === "redirect") {
				$body = require_once('view/auth_login.php');
				header('Location: ' . $_ENV['URL'] . '/?page=auth&route=login');
			}
		}
		else {
			$body = require_once('view/auth_login.php');
		}

		$scripts = require_once("view/layouts/auth_scripts.php");

		require_once('view/layout.php');

		http_response_code(200);
	}

	public function getSignup($state) {

		$header = require_once('view/layouts/auth_assets.php');

		if ($state) {
			if ($state === "activation")
				$body = require_once('view/auth_activation.php');
			else if ($state === "activate")
				$body = require_once('view/auth_activate.php');
		}
		else {
			$body = require_once('view/auth_signup.php');
		}

		$scripts = require_once("view/layouts/auth_scripts.php");

		require_once('view/layout.php');

		http_response_code(200);
	}
}