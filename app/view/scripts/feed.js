import { createPic } from "./pic.js"

const feed = document.getElementById("feed")
const user = feed.getAttribute('userId') ? {
	id: feed.getAttribute('userId'),
	username: feed.getAttribute('username'),
	avatar: feed.getAttribute('avatar')
} : null

// Gestion du header du feed

const feedHeader = document.getElementById("feed-header")

let feedLastScrollValue = 0
if (feed.clientWidth < 480) {
	feedHeader.style.top = "0px"
	feedHeader.classList.add(".mobile")
}
else {
	feedHeader.style.top = "65px"
}

// Scroll au top au click sur logo ou for you
const logo = document.querySelector('.logo');
const forYouButton = document.getElementById('feed-header-button-foryou');
const mobileHomeButton = document.getElementById('mobile-home-button');
const returnTopButtons = [
	logo,
	forYouButton,
	mobileHomeButton
]
returnTopButtons.forEach((button) => {
	button?.addEventListener('click', () => {
		if (feed) {
			feed.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
		else {
			window.location.href = "/";
		}
	});
})

// Cache ou dévoile le header
feed.addEventListener('scroll', () => {

	// Si le scroll est vers le bas et que le scroll est a + de 10px
	if (feedLastScrollValue < feed.scrollTop && feed.scrollTop > 10) {
		feedHeader.style.top = "-100px"
	}
	// Sinon si le scroll est vers le haut
	else if (feedLastScrollValue >= feed.scrollTop) {
		if (feed.clientWidth <= 480)
			feedHeader.style.top = "0px"
		else
			feedHeader.style.top = "65px"
	}

	feedLastScrollValue = feed.scrollTop
})

window.addEventListener('resize', () => {

	if (feed.clientWidth <= 480) {
		feedHeader.classList.add(".mobile")
		feedHeader.style.top = "0px"
	}
	else {
		feedHeader.classList.remove(".mobile")
		if (feedHeader.style.top = "0px")
			feedHeader.style.top = "65px"
	}
})

// Recuperation des pics

function handlePicObserver(entries) {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			const picsContainer = document.getElementById("pics-container");
			const pics = picsContainer.querySelectorAll('.pic')
			const cursor = pics.length ? pics[pics.length - 1].id : null

			const xhr = new XMLHttpRequest();
			xhr.open('GET', `/pics${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
			xhr.setRequestHeader('Pragma', 'no-cache');
	
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						const pics = JSON.parse(xhr.responseText);

						if (pics.length < 5)
							observer.unobserve(picObserver)

						for (const picData of pics) {
							const pic = createPic(picData, user);
							picsContainer.appendChild(pic)
						}
					}
					else {
						const response = JSON.parse(xhr.responseText);
						console.error(response.message);
					}
				}
			}

			xhr.send();
		}
	})
}

const picObserver = document.getElementById("refetch-pics-observer");
const observer = new IntersectionObserver(handlePicObserver, {
	rootMargin: '100px'
})
observer.observe(picObserver);

// function autoScroll(speed = 1, delay = 2000) {
// 	const feed = document.getElementById("feed");
// 	if (!feed) return;

// 	setTimeout(() => {
// 			let scrollInterval = setInterval(() => {
// 					if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight) {
// 							feed.scrollTo({ top: 0, behavior: 'instant' }); // Remonte instantanément en haut
// 					} else {
// 							feed.scrollBy({ top: speed, behavior: 'smooth' });
// 					}
// 			}, 50); // Ajuste la fréquence du scroll (en ms)
// 	}, delay); // Délai avant de commencer le scroll
// }

// // Appelle la fonction avec une vitesse et un délai personnalisables
// autoScroll(20, 3000); // Démarre après 3 secondes
