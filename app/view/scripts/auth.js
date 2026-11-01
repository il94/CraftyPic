import { trackEvent } from "./analytics.js";

const form = document.getElementsByClassName("window-form")[0];

if (form) {

	// Inputs du formlaire
	const inputs = form.querySelectorAll(".window-input");

	// Message d'erreur du formulaire
	const formErrorMessage = form.querySelector(".window-error-message");

	// Retire l'indication d'erreur apres une nouvelle entree
	for (const input of inputs) {
		input.addEventListener('keydown', () => {
			input.classList.remove("window-input-error");
			formErrorMessage.textContent = '';
		})
	}

	// Soumission du formulaire
	form.addEventListener('submit', (event) => {
		event.preventDefault();

		// Formulaire de connexion
		if (form.id === "form-login") {

			// Valeurs des inputs
			const loginValue = form.querySelector("#login-value").value;
			const passwordValue = form.querySelector("#password-value").value;

			const xhr = new XMLHttpRequest();
			xhr.open('POST', `/login`, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
			xhr.setRequestHeader('Pragma', 'no-cache');

			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 201) {
						trackEvent("signin");
						window.location.href = "/";
					}
					else {
						const response = JSON.parse(xhr.responseText);

						if (response.field === "LOGIN") {
							inputs[0].classList.add("window-input-error");
						}
						else if (response.field === "PASSWORD") {
							inputs[1].classList.add("window-input-error");
						}

						formErrorMessage.textContent = response.message;
					}
				}
			}

			const postData = `login=${encodeURIComponent(loginValue)}&password=${encodeURIComponent(passwordValue)}`;
			xhr.send(postData);
		}

		// Formulaire de recuperation de password
		else if (form.id === "form-forgot-password") {

			// Valeurs des inputs
			const loginValue = form.querySelector("#login-value").value;

			const xhr = new XMLHttpRequest();
			xhr.open('POST', `/login/forgot-password`, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
			xhr.setRequestHeader('Pragma', 'no-cache');
		
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 201) {
						trackEvent("password-forgot-request");
						window.location.href = `/login/reinitialization-start?login=${encodeURIComponent(loginValue)}`;
					}
					else {
						const response = JSON.parse(xhr.responseText);

						if (response.field === "LOGIN") {
							inputs[0].classList.add("window-input-error");
						}

						formErrorMessage.textContent = response.message;
					}
				}
			}

			const postData = `login=${encodeURIComponent(loginValue)}`;
			xhr.send(postData);
		}

		// Formulaire de reinitialisation de mot de passe
		else if (form.id === "form-reinitialization") {

			// Valeurs des inputs
			const passwordValue = form.querySelector("#password-value").value;
			const retypePasswordValue = form.querySelector("#re-type-password-value").value;

			const xhr = new XMLHttpRequest();
			xhr.open('POST', `/login/reinitialization`, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
			xhr.setRequestHeader('Pragma', 'no-cache');
		
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 201) {
						trackEvent("password-reset");
						window.location.href = `/login/reinitialized`;
					}
					else {
						const response = JSON.parse(xhr.responseText);

						if (response.field === "PASSWORD") {
							inputs[0].classList.add("window-input-error");
						}
						else if (response.field === "RETYPE_PASSWORD") {
							inputs[1].classList.add("window-input-error");
						}

						formErrorMessage.textContent = response.message;
					}
				}
			}

			const token = new URLSearchParams(window.location.search).get("token");
			const postData = `password=${encodeURIComponent(passwordValue)}&retypepassword=${encodeURIComponent(retypePasswordValue)}&token=${encodeURIComponent(token)}`;
			xhr.send(postData);
		}		

		// Formulaire d'inscription
		else if (form.id === "form-signup") {

			// Valeurs des inputs
			const emailValue = form.querySelector("#email-value").value;
			const usernameValue = form.querySelector("#username-value").value;
			const passwordValue = form.querySelector("#password-value").value;
			const retypePasswordValue = form.querySelector("#re-type-password-value").value;

			const xhr = new XMLHttpRequest();
			xhr.open('POST', `/signup`, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
			xhr.setRequestHeader('Pragma', 'no-cache');
		
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 201) {
						trackEvent("signup");
						window.location.href = `/signup/activation?email=${encodeURIComponent(emailValue)}`
					}
					else {
						const response = JSON.parse(xhr.responseText);

						if (response.field === "EMAIL") {
							inputs[0].classList.add("window-input-error");
						}
						else if (response.field === "USERNAME") {
							inputs[1].classList.add("window-input-error");
						}
						else if (response.field === "PASSWORD") {
							inputs[2].classList.add("window-input-error");
						}
						else if (response.field === "RETYPE_PASSWORD") {
							inputs[3].classList.add("window-input-error");
						}

						formErrorMessage.textContent = response.message;
					}
				}
			}

			const postData = `email=${encodeURIComponent(emailValue)}&username=${encodeURIComponent(usernameValue)}&password=${encodeURIComponent(passwordValue)}&retypepassword=${encodeURIComponent(retypePasswordValue)}`;
			xhr.send(postData);
		}		
	})
}

// Permet aux boutons "login" de rediriger vers la page de connexion
const loginRedirectionButtons = document.getElementsByClassName("login-redirection-button");
const returnButton = document.getElementsByClassName("window-return-button");

for (const button of [...loginRedirectionButtons, ...returnButton]) {
	button.addEventListener('click', () => {
		window.location.href = "/login";
	});
}
