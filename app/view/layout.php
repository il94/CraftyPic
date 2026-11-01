<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Twinkle+Star&display=swap" rel="stylesheet">

	<meta name="csrf-token" content="<?php echo $_SESSION['csrf_token']; ?>">

	<?php $umamiTag = (strpos($_ENV['URL'] ?? '', 'localhost') !== false) ? 'development' : 'production'; ?>
	<script defer src="https://umami.ilandols.com/script.js"
		data-website-id="e9e7d0a7-d75d-4a42-a9d2-f356364e1d0a" data-tag="<?php echo $umamiTag; ?>"></script>

	<link rel="stylesheet" type="text/css" href="/view/assets/index.css">
	<link rel="stylesheet" type="text/css" href="/view/assets/colors.css">

	<link rel="stylesheet" type="text/css" href="/view/assets/page.css">
	<link rel="stylesheet" type="text/css" href="/view/assets/mobile_navbar.css">

	<?php $headers; ?>

	<link rel="icon" type="image/x-icon" href="/public/favicon.ico">
	<title>CraftyPic</title>
	<meta
		name="description"
		lang="fr"
		content="Bienvenue sur CraftyPic ! Customisez vos photos et partagez les à vos amis. Rejoignez la communauté et laissez parler votre créativité !"
	/>
	<meta
		name="description"
		lang="en"
		content="Welcome to CraftyPic ! Customize your photos and share them with your friends. Join the community and let your creativity shine !"
	/>
</head>

<body>

	<?php $body; ?>
	<?php require_once('view/mobile_navbar.php'); ?>

</body>

<?php $scripts; ?>

</html>