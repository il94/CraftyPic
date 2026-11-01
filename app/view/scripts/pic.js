import { createComment, displayComment } from "./comment.js";
import { trackEvent } from "./analytics.js";

export function getRandomColor() {
	const r = Math.floor(Math.random() * 256);
	const g = Math.floor(Math.random() * 256);
	const b = Math.floor(Math.random() * 256);

	const color = `rgba(${r}, ${g}, ${b}, 0.5)`
	const darkColor = `rgba(0, 0, 0, 0.3)`

	return ([color, darkColor]);
}

// Soumet une requete au serveur pour poster le contenu de l'input text
function postComment(pic, inputText, user) {
	const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

	const xhr = new XMLHttpRequest();
	xhr.open('POST', `/comment`, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	xhr.setRequestHeader('Pragma', 'no-cache');
	xhr.setRequestHeader('X-CSRF-Token', csrfToken);
	
	if (inputText.value < 1 || encodeURIComponent(inputText.value).length > 255)
		return

	const commentsContainer = pic.querySelector('#comments-container');
	const commentData = {
		id: -1,
		user,
		content: inputText.value
	}

	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) {
			if (xhr.status === 201) {
				// Compteur seul : aucun contenu de commentaire n'est transmis.
				trackEvent("comment-post");
			}
			else {
				const response = JSON.parse(xhr.responseText);
				console.error(response.message);
			}
		}
	}
	const postData = `picId=${encodeURIComponent(pic.id)}&comment=${encodeURIComponent(inputText.value)}`;
	xhr.send(postData)

	const newComment = createComment(commentData)
	commentsContainer.prepend(newComment);

	const commentsCount = pic.querySelector('#comments-count');
	const count = +commentsCount.getAttribute('count') + 1;
	commentsCount.setAttribute('count', count);
	commentsCount.textContent = `${count} ${count < 2 ? 'comment' : 'comments'}`

	inputText.value = ''
}

export function createPic(picData, user) {
	const pic = document.createElement("div");
	pic.className = "pic"
	pic.id = picData.id

	pic.innerHTML = `

		<div class="pic-recto">
			<div class="pic-header">
				<div class="pic-header-user-datas">
					<img src="${picData.user.avatar}" />
					<p>${picData.user.username}</p>
				</div>
				<div class="pic-header-icons">
					${user ? `
						<button class="button-icon selectable trash">
							<svg class="icon" width="33" height="39" viewBox="0 0 33 39" xmlns="http://www.w3.org/2000/svg">
							<path fill="none" d="M28.1 13.6667L26.476 29.9961C26.2305 32.4714 26.1087 33.7081 25.548 34.6433C25.0563 35.4666 24.3331 36.125 23.4697 36.5353C22.4895 37 21.256 37 18.7813 37H14.2187C11.7459 37 10.5105 37 9.53033 36.5333C8.66623 36.1233 7.94232 35.465 7.45007 34.6414C6.89327 33.7081 6.76953 32.4714 6.52207 29.9961L4.9 13.6667M19.4 26.3056V16.5833M13.6 26.3056V16.5833M2 8.80556H10.9223M10.9223 8.80556L11.6686 3.61C11.8851 2.665 12.6662 2 13.5633 2H19.4367C20.3338 2 21.1129 2.665 21.3314 3.61L22.0777 8.80556M10.9223 8.80556H22.0777M22.0777 8.80556H31" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					` : ''}
					<button class="button-icon more">
						<svg class="icon" width="38" height="9" viewBox="0 0 38 9" xmlns="http://www.w3.org/2000/svg">
						<circle cx="4.5" cy="4.5" r="4.5" fill="white"/>
						<circle cx="33.5" cy="4.5" r="4.5" fill="white"/>
						<circle cx="19.5" cy="4.5" r="4.5" fill="white"/>
						</svg>
					</button>
				</div>
			</div>
			<div class="pic-body-recto">
				<img src="${picData.image}" />
			</div>
			

			<div class="pic-footer">
				${user ? `
					<button class="like-button button-icon selectable ${picData.liked ? 'selected like' : ''}">
						<svg id="like-icon" class="icon" width="44" height="38" viewBox="0 0 44 38" xmlns="http://www.w3.org/2000/svg">
						<path fill="none" d="M12.8955 2C6.87823 2 2 6.87823 2 12.8955C2 23.7911 14.8765 33.6961 21.8101 36C28.7436 33.6961 41.6201 23.7911 41.6201 12.8955C41.6201 6.87823 36.7419 2 30.7246 2C27.0399 2 23.7812 3.82946 21.8101 6.62961C20.8054 5.19854 19.4706 4.03062 17.9189 3.22475C16.3671 2.41887 14.6441 1.99877 12.8955 2Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
					<button class="comment-button button-icon">
						<svg class="icon" width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
						<path fill="none" d="M19 36C22.3623 36 25.6491 35.003 28.4447 33.135C31.2403 31.267 33.4193 28.612 34.7059 25.5056C35.9926 22.3993 36.3293 18.9811 35.6733 15.6835C35.0174 12.3858 33.3983 9.35668 31.0208 6.97919C28.6433 4.6017 25.6142 2.98261 22.3165 2.32666C19.0189 1.67071 15.6007 2.00737 12.4944 3.29406C9.38804 4.58074 6.733 6.75968 4.86502 9.55531C2.99703 12.3509 2 15.6377 2 19C2 21.8107 2.68 24.4608 3.88889 26.7954L2 36L11.2046 34.1111C13.5392 35.32 16.1912 36 19 36Z" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				` : ''}
			</div>
		</div>
		<div class="pic-verso">
			<div class="pic-header">
				<div class="pic-header-stats">
					<p id="likes-count" count="${picData.likesCount}"></p>
					<p id="comments-count" count="${picData.commentsCount}"></p>
				</div>
				<div class="pic-header-icons">
					${user ? `
						<button class="button-icon selectable trash">
							<svg class="icon" width="33" height="39" viewBox="0 0 33 39" xmlns="http://www.w3.org/2000/svg">
							<path fill="none" d="M28.1 13.6667L26.476 29.9961C26.2305 32.4714 26.1087 33.7081 25.548 34.6433C25.0563 35.4666 24.3331 36.125 23.4697 36.5353C22.4895 37 21.256 37 18.7813 37H14.2187C11.7459 37 10.5105 37 9.53033 36.5333C8.66623 36.1233 7.94232 35.465 7.45007 34.6414C6.89327 33.7081 6.76953 32.4714 6.52207 29.9961L4.9 13.6667M19.4 26.3056V16.5833M13.6 26.3056V16.5833M2 8.80556H10.9223M10.9223 8.80556L11.6686 3.61C11.8851 2.665 12.6662 2 13.5633 2H19.4367C20.3338 2 21.1129 2.665 21.3314 3.61L22.0777 8.80556M10.9223 8.80556H22.0777M22.0777 8.80556H31" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					` : ''}
					<button class="button-icon more">
						<svg class="icon" width="38" height="9" viewBox="0 0 38 9" xmlns="http://www.w3.org/2000/svg">
						<circle cx="4.5" cy="4.5" r="4.5" fill="white"/>
						<circle cx="33.5" cy="4.5" r="4.5" fill="white"/>
						<circle cx="19.5" cy="4.5" r="4.5" fill="white"/>
						</svg>
					</button>
				</div>
			</div>
			<div class="pic-body-verso">
			<div id="comments-container">
				<div style="height: 1px" id="refetch-comments-observer"></div>
			</div>
			</div>
			<div class="pic-footer-verso">
				${user && !user.demo ? `
					<div class="pic-input">
						<span class="placeholder">Do you like this pic ? Let us know !</span>
						<textarea class="pic-input-text" maxlength="255" username="${user.username}" avatar="${user.avatar}"></textarea>
						<button class="arrow-up-button button-icon" type="submit">
							<svg class="icon" width="32" height="34" viewBox="0 0 32 34" xmlns="http://www.w3.org/2000/svg">
							<path fill="none" d="M2 15.8462L15.8462 2L29.6923 15.8462M15.8462 3.92308V32" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
					</div>
				` : ''}
			</div>
		</div>
	`

	// Applique une couleur random a la pic
	const picHeader = pic.querySelector(".pic-header")
	const picFooter = pic.querySelector(".pic-footer")
	const picBodyRecto = pic.querySelector(".pic-body-recto")
	const [picColor, picBodyRectoColor] = getRandomColor()
	// picHeader.style.backgroundColor = picColor;
	// picFooter.style.backgroundColor = picColor;
	pic.style.backgroundColor = picColor;
	picBodyRecto.style.backgroundColor = picBodyRectoColor;

	// buttons
	const buttonIcons = document.getElementsByClassName("button-icon")

	for (const buttonIcon of buttonIcons) {
		const icons = buttonIcon.querySelectorAll(".icon")
	
		buttonIcon.addEventListener('click', () => {
	
			if (buttonIcon.classList.contains("selectable"))
			{	
				if (buttonIcon.classList.contains("selected"))
					icons.forEach(icon => icon.style.opacity = 0.5);
				else
					icons.forEach(icon => icon.style.opacity = 1);
				buttonIcon.classList.toggle("selected")
			}
		})
	
		buttonIcon.addEventListener('mouseenter', () => {
			icons.forEach(icon => icon.style.opacity = 1);
		})
	
		buttonIcon.addEventListener('mouseleave', () => {
			if (!buttonIcon.classList.contains("selected"))
				icons.forEach(icon => icon.style.opacity = 0.5);
		})
	}
	
	const selectablesButtons = document.getElementsByClassName('selectable')
	
	document.addEventListener('click', (event) => {
		for (const button of selectablesButtons) {
			if (!button.contains(event.target) && button.classList.contains("selected") && !button.classList.contains("like"))
			{
				button.classList.remove("selected")
				const icon = button.querySelector(".icon")
				if (icon)
					icon.style.opacity = 0.5
				break
			}
		}
	})

	// Like
	const likesCount = pic.querySelector('#likes-count');
	const likes = likesCount.getAttribute('count');
	likesCount.textContent = `${likes} ${likes < 2 ? 'like' : 'likes'}`

	if (user) {
		const likeButton = pic.querySelector(".like-button")
		likeButton.addEventListener('click', () => {
			const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
		
			const xhr = new XMLHttpRequest();
			xhr.open('POST', `/like`, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
			xhr.setRequestHeader('Pragma', 'no-cache');
			xhr.setRequestHeader('X-CSRF-Token', csrfToken);
		
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 201) {
						trackEvent("pic-like");

						const likesCount = pic.querySelector('#likes-count');
						const count = +likesCount.getAttribute('count') + 1;
						likesCount.setAttribute('count', count);
						likesCount.textContent = `${count} ${count < 2 ? 'like' : 'likes'}`
					}
					else if (xhr.status === 200) {
						trackEvent("pic-unlike");

						const likesCount = pic.querySelector('#likes-count');
						const count = +likesCount.getAttribute('count') - 1;
						likesCount.setAttribute('count', count);
						likesCount.textContent = `${count} ${count < 2 ? 'like' : 'likes'}`
					}
					else {
						const response = JSON.parse(xhr.responseText);
						console.error(response.message);
					}
				}
			}
			const postData = `picId=${encodeURIComponent(pic.id)}`;
			xhr.send(postData)

			likeButton.classList.toggle("like")
			likeButton.classList.toggle("selected")
		})
	}

	// Recuperation des comments

	function handleCommentsObserver(entries) {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const comments = commentsContainer.querySelectorAll('.comment')
				const cursor = comments.length ? comments[comments.length - 1].id : null

				const xhr = new XMLHttpRequest();
				xhr.open('GET', `/comments?picId=${encodeURIComponent(picData.id)}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, true);
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
				xhr.setRequestHeader('Pragma', 'no-cache');
			
				xhr.onreadystatechange = () => {
					if (xhr.readyState === 4) {
						if (xhr.status === 200) {
							const comments = JSON.parse(xhr.responseText);

							if (comments.length < 20)
								observer.unobserve(commentsObserver)
	
							for (const commentData of comments) {
								const comment = displayComment(commentData);
								commentsContainer.insertBefore(comment, commentsObserver)
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

	const commentsContainer = pic.querySelector("#comments-container");
	const commentsObserver = pic.querySelector("#refetch-comments-observer");
	const observer = new IntersectionObserver(handleCommentsObserver)

	// Effet de flip
	const moreButtons = pic.querySelectorAll(".more")
	moreButtons.forEach((moreButton) => moreButton.addEventListener('click', () => {
		pic.classList.toggle('flip');

		if (pic.classList.contains('flip'))
			observer.observe(commentsObserver);
		else
			observer.unobserve(commentsObserver)
	}))

	// Suppression
	if (user) {
		const deletePopup = document.getElementById('delete-popup');
		const trashButtons = pic.querySelectorAll(".trash")
		trashButtons.forEach((trashButton) => {
			if (picData.user.id == user.id)
				trashButton.style.display = 'block'

			trashButton.addEventListener('click', () => {
			deletePopup.style.display = 'flex';
			deletePopup.setAttribute('picId', picData.id)
		})})
	}

	// Commentaires

	const commentsCount = pic.querySelector('#comments-count');
	const commentsCounter = commentsCount.getAttribute('count');
	commentsCount.textContent = `${commentsCounter} ${commentsCounter < 2 ? 'comment' : 'comments'}`

	// Post de commentaires
	if (user) {
		const inputText = pic.querySelector(".pic-input-text");

		const commentButton = pic.querySelector(".comment-button")
		commentButton.addEventListener('click', () => {
			pic.classList.toggle('flip');

			if (pic.classList.contains('flip'))
				observer.observe(commentsObserver);
			else
				observer.unobserve(commentsObserver)

			inputText?.focus()
		})

		// Le compte de demonstration peut lire les commentaires mais pas en poster :
		// sa zone de saisie n'est pas rendue, il n'y a rien de plus a brancher
		if (!inputText)
			return pic

		const arrowUpButton = pic.querySelector('.arrow-up-button');
		arrowUpButton.addEventListener('click', () => {		
			postComment(pic, inputText, user);
		})

		inputText.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				postComment(pic, event.target, user);
			}
		})


		// Deplacments du placeholder
		const placeHolder = pic.querySelector(".placeholder");

		// Reduit le placeholder au clic sur la zone de texte
		inputText.addEventListener('focus', () => {
			if (!placeHolder.classList.contains(".reduce"))
				placeHolder.classList.add("reduce");
		})
		
		// Si la zone de texte est vide, recentre le placeholder
		inputText.addEventListener('blur', (event) => {
			if (!event.target.value)
				placeHolder.classList.remove("reduce");
		})


		// Gere la taille de la zone de texte, en l'agrandissant et en reduisant les commentaires
		const bodyVerso = pic.querySelector(".pic-body-verso")
		const footerVerso = pic.querySelector(".pic-footer-verso")
		const input = pic.querySelector(".pic-input");

		const charHeight = 22 // Height d'une ligne de caracteres d'une font size de 18px
		const headerHeight = 52 // Height du header

		inputText.addEventListener('keydown', (event) => {
			if (encodeURIComponent(event.target.value).length > 255 && event.key !== "Backspace" && event.key !== "Delete")
				event.preventDefault();

			if (event.key === "Backspace" && event.target.value) {
				inputText.style.height = inputText.scrollHeight - charHeight + 'px'
				input.style.height = inputText.scrollHeight + 'px'
				
				const footerNewSize = inputText.scrollHeight + charHeight
				footerVerso.style.height = footerNewSize + 'px'
				bodyVerso.style.height = `calc(100% - ${footerNewSize + headerHeight + 'px'})`
			}
		});
		inputText.addEventListener('input', (event) => {
			// Si le texte va depasser de la zone et que la zone est inferieure a la moitie de la pic
			if (inputText.clientHeight !== inputText.scrollHeight &&
				input.clientHeight < pic.clientHeight / 2)
			{
				inputText.style.height = inputText.scrollHeight + 'px'
				input.style.height = inputText.scrollHeight + charHeight + 'px'
				
				const footerNewSize = inputText.scrollHeight + charHeight * 2
				footerVerso.style.height = footerNewSize + 'px'
				bodyVerso.style.height = `calc(100% - ${footerNewSize + headerHeight + 'px'})`
			}
			if (encodeURIComponent(event.target.value).length > 255)
				input.classList.add('error')
			else
				input.classList.remove('error')
		})
	}
	return pic
}

export function createPicMini(image, id) {
	const picMini = document.createElement("div");
	picMini.className = "pic mini"
	picMini.id = id

	picMini.innerHTML = `
		<div class="pic-header mini"></div>

		<div class="pic-body-recto mini">
			<img class="preview" src="${image}" />
		</div>
		
		<div class="pic-footer mini"></div>
	`

	// Applique une couleur random a la pic
	picMini.style.backgroundColor = getRandomColor();

	return picMini
}