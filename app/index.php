<?php

require_once('init.php');
require_once('config.php');

require_once('controller/AuthController.php');
require_once('controller/HomeController.php');
require_once('controller/CreateController.php');
require_once('controller/SettingsController.php');

$authController = new AuthController();
$homeController = new HomeController();
$createController = new CreateController();
$settingsController = new SettingsController();

session_start();

if (paramExist($_GET['page'])) {

	// HOME
	if ($_GET['page'] === 'home') {

		if (!$_SESSION['logged_in']) {
			$body = require_once('view/pas_co.php');

			require_once('view/layout.php');
		}
		else {

			// POST
			if ($_SERVER['REQUEST_METHOD'] === 'POST') {

				// COMMENT
				if ($_GET['route'] === 'comment') {
					$homeController->postComment($_SESSION['logged_in'], $_POST['picId'], $_POST['comment']);
				}

				// LIKE
				else if ($_GET['route'] === 'like') {
					$homeController->likePic($_SESSION['logged_in'], $_POST['picId']);
				}
			}

			// GET
			else if ($_SERVER['REQUEST_METHOD'] === 'GET') {

				if (paramExist($_GET['route'])) {

					// PICS
					if ($_GET['route'] === 'pics') {
						$homeController->getPics($_SESSION['logged_in'], $_GET['cursor']);
						http_response_code(200);
					}

					// COMMENTS
					else if ($_GET['route'] === 'comments') {
						$homeController->getComments($_GET['picId'], $_GET['cursor']);
						http_response_code(200);
					}
				}

				// DEFAULT
				else {
					$homeController->get(null, null);
				}
			}

			// DELETE
			else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
				$homeController->deletePic($_SESSION['logged_in'], $_GET['picId']);
				http_response_code(200);
			}
		}

	}

	// CREATE
	else if ($_GET['page'] === 'create') {

		if (!$_SESSION['logged_in']) {
			$body = require_once('view/pas_co.php');

			require_once('view/layout.php');
		}
		else {

			// POST
			if ($_SERVER['REQUEST_METHOD'] === 'POST') {
				$createController->createPic($_SESSION['logged_in'], $_FILES);
			}

			// GET
			else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
				$createController->get(null, null);
			}
		}
	}

	// AUTH
	else if ($_GET['page'] === 'auth') {

		// POST
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {

			// LOGIN
			if ($_GET['route'] === 'login') {
				$authController->login($_POST['login'], $_POST['password']);
			}

			// FORGOT PASSWORD
			else if ($_GET['route'] === 'forgot-password') {
				$authController->forgotPassword($_POST['login']);
			}

			// REINITIALIZATION
			else if ($_GET['route'] === 'reinitialization') {
				$authController->reinitialization($_POST['password'], $_POST['retypepassword'], $_POST['token']);
			}

			// SIGNUP
			else if ($_GET['route'] === 'signup') {
				$authController->signup($_POST['email'], $_POST['username'], $_POST['password'], $_POST['retypepassword']);
			}

			else if ($_GET['route'] === 'update') {
				$authController->update($_SESSION['logged_in'], $_POST, $_FILES);
			}

			// LOGOUT
			else if ($_GET['route'] === 'logout') {
				$authController->logout();
			}
		}

		// GET
		else if ($_SERVER['REQUEST_METHOD'] === 'GET') {

			// SIGNUP
			if ($_GET['route'] === 'signup') {

				// ACTIVATE
				if (paramExist($_GET['state'])) {
					$authController->getSignup($_GET['state'], null);
					http_response_code(200);
				}

				// ACTIVATION
				else if (paramExist($_GET['token'])) {
					$authController->activateAccount($_GET['token']);
					http_response_code(200);
				}

				// DEFAULT
				else {
					$authController->getSignup(null, null);
					http_response_code(200);
				}
			}

			// LOGIN
			else if ($_GET['route'] === 'login') {

				// FORGOT PASSWORD
				if (paramExist($_GET['state'])) {
					$authController->getLogin($_GET['state'], null);
					http_response_code(200);
				}

				// DEFAULT
				else {
					$authController->getLogin(null, null);
					http_response_code(200);
				}
			}
		}
	}

	// SETTINGS
	else if ($_GET['page'] === 'settings') {

		if (!$_SESSION['logged_in']) {
			$body = require_once('view/pas_co.php');

			require_once('view/layout.php');
		}
		else {

			// GET
			if ($_SERVER['REQUEST_METHOD'] === 'GET') {

				// STATE
				if (paramExist($_GET['state'])) {
					$settingsController->get($_GET['state'], null);
					http_response_code(200);
				}

				// UPDATE
				else if (paramExist($_GET['token'])) {

					// echo "LOL";
					$settingsController->updateEmail($_GET['email'], $_GET['token']);
					http_response_code(200);
				}

				// UPDATED
				else if ($_GET['route'] === 'updated') {
					$settingsController->get(null, null);
				}

				// DEFAULT
				else {
					$settingsController->get(null, null);
				}
			}

		}
	}

	else {
		$body = require_once('view/not_found.php');

		require_once('view/layout.php');
	}

}

else {
	// initApp(); // A appeller lors du premier lancement du programme

	$authController->getLogin(null, null);
}