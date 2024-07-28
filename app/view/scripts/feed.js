import { createPic } from "./pic.js"

const feed = document.getElementById("feed")
const user = {
	id: feed.getAttribute('userId'),
	username: feed.getAttribute('username'),
	avatar: feed.getAttribute('avatar')
}

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
logo.addEventListener('click', () => {
	feed.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
});

const forYouButton = document.getElementById('feed-header-button-foryou');
forYouButton.addEventListener('click', () => {
	feed.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
});

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

function handlePicObserver() {
	const picsContainer = document.getElementById("pics-container");
	const pics = picsContainer.querySelectorAll('.pic')
	const cursor = pics.length ? pics[pics.length - 1].id : null

	if (cursor == 1) return

	const xhr = new XMLHttpRequest();
	xhr.open('GET', `index.php?page=home&route=pics${cursor ? `&cursor=${cursor}` : ''}`, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				const pics = JSON.parse(xhr.responseText);

				for (const picData of pics) {
					const pic = createPic(picData, user);
					picsContainer.appendChild(pic)
				}
			}
			else {
				console.error("ERROR", xhr.responseText);
			}
		}
	}

	xhr.send();
}

const picObserver = document.getElementById("refetch-pics-observer");
new IntersectionObserver(handlePicObserver).observe(picObserver);