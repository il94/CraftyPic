import { trackEvent } from "./analytics.js";

/* CREATE BUTTON */

const createButtons = document.getElementsByClassName("create-button");
for (const createButton of createButtons) {
	createButton.addEventListener('click', () => {
		window.location.href = "/create";
	})
}

/* ANGLE POPUP */

const settingsButton = document.getElementById("settings-button");
settingsButton?.addEventListener('click', () => {
	window.location.href = "/settings";
})

const logoutButton = document.getElementById("logout-button");
logoutButton?.addEventListener('click', () => {
	const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

	const xhr = new XMLHttpRequest();
	xhr.open('POST', `/logout`, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	xhr.setRequestHeader('Pragma', 'no-cache');
	xhr.setRequestHeader('X-CSRF-Token', csrfToken);

	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				trackEvent("logout");
				window.location.href = "/login";
			}
			else {
				const response = JSON.parse(xhr.responseText);
				console.error(response.message);
			}
		}
	}

	xhr.send();
})

// Suppression
const deletePopup = document.getElementById('delete-popup');
const deletePicForm = document.getElementById('delete-pic-form');

const closeDeletePopup = document.getElementById('close-delete-popup')
closeDeletePopup?.addEventListener('click', () => {
	deletePopup.style.display = 'none';
})

deletePicForm?.addEventListener('submit', (event) => {
	event.preventDefault()

	const picId = deletePopup.getAttribute('picId')

	const xhr = new XMLHttpRequest();
	xhr.open('DELETE', `/?picId=${encodeURIComponent(picId)}`, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	xhr.setRequestHeader('Pragma', 'no-cache');

	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				trackEvent("pic-delete");

				const pics = Array.from(document.getElementsByClassName('pic'));
				const pic = pics.find((pic) => pic.id === picId)

				pic.remove()
				deletePopup.style.display = 'none';
			}
			else {
				const response = JSON.parse(xhr.responseText);
				console.error(response.message);
			}
		}
	}

	xhr.send();
})

/* AUTH BUTTON GUEST */

const authButtons = document.getElementsByClassName("auth-button");
for (const authButton of authButtons) {
	authButton?.addEventListener('click', () => {
		window.location.href = "/";
	})
}
