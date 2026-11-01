<div id="auth">

	<h1 class="logo">CraftyPic</h1>

	<div id="window-activate" class="window success">
		<p class="window-title random"></p>
		<p class="window-message">Your email has been successfully verified.</p>
		<button class="window-button login-redirection-button">
			Log in
		</button>
	</div>

</div>

<script type="module">
	import { trackEvent } from "/view/scripts/analytics.js";
	// Le snippet Umami (defer) est rendu après cette vue dans le flux PHP :
	// on attend qu'il soit prêt avant d'émettre l'event.
	const fire = (tries = 0) => {
		if (window.umami) trackEvent("account-activated");
		else if (tries < 50) setTimeout(() => fire(tries + 1), 100);
	};
	fire();
</script>