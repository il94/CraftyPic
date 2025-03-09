<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Twinkle+Star&display=swap" rel="stylesheet">

	<meta name="csrf-token" content="<?php echo $_SESSION['csrf_token']; ?>">
	
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