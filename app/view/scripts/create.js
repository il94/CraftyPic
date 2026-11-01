import { createPicMini, getRandomColor } from "./pic.js";
import { trackEvent } from "./analytics.js";

/* ANGLE POPUP */

const createButton = document.getElementsByClassName("create-button")[0];
createButton.style.display = 'none'

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

/* PICS */

const pics = document.getElementsByClassName('pic')

const [picColor, picBodyRectoColor] = getRandomColor()
for (const pic of pics) {

	// Applique une couleur random a la pic
	const picBodyRecto = pic.querySelector(".pic-body-recto")
	pic.style.backgroundColor = picColor;
	picBodyRecto.style.backgroundColor = picBodyRectoColor;

	const likeButton = pic.querySelector(".like-button")
	if (likeButton) {
		likeButton.addEventListener('click', () => {
			likeButton.classList.toggle("like")
			likeButton.classList.toggle("selected")
		})
	}
}

/* ================ CREATE PIC ================ */

async function handlePanel(button) {
	video.style.display = 'none'
	galleryImage.style.display = 'none';
	inputFile.value = ''
	previewImage.style.display = 'none';
	cameraOffScreen.style.display = 'none';
	clearStickers()

	for (const button of cameraButtons) {
		button.classList.add('blocked')
	}
	for (const button of onOffButtons) {
		button.classList.add('error')
		button.classList.remove('success')
	}

	if (button == 'onoff') {
		if (!stream) {
			try {
				cameraOffScreen.style.display = 'flex';
				stream = await navigator.mediaDevices.getUserMedia({ video: true })
			
				video.srcObject = stream;
				video.play();
				video.style.display = 'block'
				cameraOffScreen.style.display = 'none';
				for (const button of onOffButtons) {
					button.classList.remove('error')
					button.classList.add('success')
				}
				for (const button of cameraButtons) {
					button.classList.remove('blocked')
				}
			}
			catch (error) {
				console.error(error);

				if (stream) {
					const tracks = stream.getTracks();
					tracks.forEach(track => track.stop());
					stream = null
				}
				
				cameraOffScreen.style.display = 'flex';	
			}
		}
		else {
			const tracks = stream.getTracks();
			tracks.forEach(track => track.stop());
			stream = null
			
			cameraOffScreen.style.display = 'flex';
		}
	}
	else {
		if (stream) {
			const tracks = stream.getTracks();
			tracks.forEach(track => track.stop());
			stream = null
		}

		if (button == 'gallery') {
			galleryImage.style.display = 'block';
			for (const button of cameraButtons) {
				button.classList.remove('blocked')
			}
		}
		else if (button == 'preview') {
			previewImage.style.display = 'block';
		}
	}
}

const picModel = document.getElementById('pic-model')
const picBodyRecto = picModel.querySelector(".pic-body-recto");
const previewBar = document.getElementById("preview-bar")
const previewBar2 = document.getElementById("previews")
const cameraButtons = document.getElementsByClassName("camera-button");
const trashButton = document.getElementById("trash");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const PICSIZE = 400

let stickerSelected;
const stickersList = document.getElementsByClassName("sticker")
for (const sticker of stickersList) {
	sticker.addEventListener('click', async (event) => {
		stickerSelected = event.target;

		const svg = stickerSelected.src.replace(".png", ".svg")
		const videoRect = video.getBoundingClientRect()
		const galleryRect = galleryImage.getBoundingClientRect()

		const widthVideo = sticker.width / (PICSIZE / videoRect.width)
		const heightVideo = sticker.height / (PICSIZE / videoRect.width)

		const widthGallery = sticker.width / (PICSIZE / galleryRect.width)
		const heightGallery = sticker.height / (PICSIZE / galleryRect.width)

		const response = await fetch(svg);
		let svgText = await response.text();

		let svgTextVideo = svgText.replace(/width="[^"]+"/, `width="${widthVideo}px"`);
		svgTextVideo = svgTextVideo.replace(/height="[^"]+"/, `height="${heightVideo}px"`);

		let svgTextGallery = svgText.replace(/width="[^"]+"/, `width="${widthGallery}px"`);
		svgTextGallery = svgTextGallery.replace(/height="[^"]+"/, `height="${heightGallery}px"`);
		
		const svgBlobVideo = new Blob([svgTextVideo], { type: 'image/svg+xml' });
		const svgDataURLVideo = URL.createObjectURL(svgBlobVideo);
		
		const svgBlobGallery = new Blob([svgTextGallery], { type: 'image/svg+xml' });
		const svgDataURLGallery = URL.createObjectURL(svgBlobGallery);
		
		video.style.cursor = `url('${svgDataURLVideo}') ${widthVideo / 2} ${heightVideo / 2}, auto`;
		galleryImage.style.cursor = `url('${svgDataURLGallery}') ${widthGallery / 2} ${heightGallery / 2}, auto`;
	});
}

const video = picModel.querySelector("#video");

const onOffButtons = document.getElementsByClassName('onoff-button');
const cameraOffScreen = document.getElementById('camera-off');

const galleryImage = document.getElementById('gallery-image');
const galleryButtons = document.getElementsByClassName('gallery-button');
const inputFile = document.getElementById('input-file');

const previewImage = document.getElementById('preview-image');

const publishButtons = document.getElementsByClassName('publish-button');

// Le compte de demonstration a l'editeur entier, mais ne peut pas publier
// (cf. lib/demo.php) : ses boutons Publish restent bloques
const demo = document.getElementById('creator').getAttribute('demo') === '1'

let stream = null

await handlePanel('onoff')

for (const button of onOffButtons) {
	button?.addEventListener('click', async () => {
		await handlePanel('onoff')
	})
}

for (const button of galleryButtons) {
	button?.addEventListener('click', () => {
		inputFile.click()
	})
}

let picCount = 0

const picMinis = document.getElementsByClassName('pic mini')
trashButton.addEventListener('click', async () => {

	if (video.style.display === 'block' || galleryImage.style.display === 'block')
		clearStickers()
	else if (previewImage.style.display === 'block') {
		const picsToRemove = [];

		for (const picMini of picMinis) {
			const preview = picMini.querySelector(".preview")
			if (preview.src === previewImage.src) {
				picsToRemove.push(picMini)
				canvasList = canvasList.filter((canvas) => canvas.id != picMini.id)
				if (canvasList.length === 0) {
					for (const button of publishButtons) {
						button.classList.add('blocked')
					}
				}
			}
		}
		picsToRemove.forEach((picMini) => picMini.remove())
		picCount--

		await handlePanel('onoff')
	}

})

inputFile.addEventListener('change', (event) => {
   const fileInput = event.target;
   const file = fileInput.files[0];

   if (file) {
		trackEvent("editor-image-import");

		const reader = new FileReader();

		reader.onload = async (e) => {
			const img = new Image();
			img.onload = () => {

				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');

				canvas.width = PICSIZE;
				canvas.height = PICSIZE;

				const min = Math.min(img.naturalWidth, img.naturalHeight)

				const offsetX = (img.naturalWidth - min) / 2;
				const offsetY = (img.naturalHeight - min) / 2;

				ctx.drawImage(img, offsetX, offsetY, min, min, 0, 0, PICSIZE, PICSIZE);
				galleryImage.src = canvas.toDataURL();
			}
			img.src = e.target.result;
			await handlePanel('gallery')
		};

		reader.readAsDataURL(file);
	}
});

// Place les stickers sur l'image
function drawStickers(element, size, size2) {

	if (!stickerSelected) return

	const elementRect = element.getBoundingClientRect();
	const picBodyRectoRect = picBodyRecto.getBoundingClientRect();

	const img = document.createElement('img');
	img.src = stickerSelected.src;
	img.className = 'sticker';
	img.style.position = 'absolute';

	const frontOffsetX = elementRect.left - picBodyRectoRect.left

	const frontClickX = event.clientX - elementRect.left ;
	const frontClickY = event.clientY - elementRect.top;

	const frontStickerWidthPx = stickerSelected.width * (elementRect.height / PICSIZE);
   const frontStickerHeightPx = stickerSelected.height * (elementRect.height / PICSIZE);

	// Rendu direct front
	img.style.left = `${frontOffsetX + frontClickX - frontStickerWidthPx / 2}px`;
   img.style.top = `${frontClickY - frontStickerHeightPx / 2}px`;
	img.style.width = `${frontStickerWidthPx}px`;
	img.style.height = `${frontStickerHeightPx}px`;

	const backOffsetX = (size2 - size) / 2

	const backClickX = (frontClickX * (Math.max(size / PICSIZE, PICSIZE / size)))
	const backClickY = (frontClickY * (Math.max(size / PICSIZE, PICSIZE / size)))	

	const backStickerWidthPx = stickerSelected.width * (Math.max(size / PICSIZE, 1))
	const backStickerHeightPx = stickerSelected.height * (Math.max(size / PICSIZE, 1))

	// Rendu back
	img.baseLeft = `${backOffsetX + backClickX - backStickerWidthPx / 2}px`;
	img.baseTop = `${backClickY - backStickerHeightPx / 2}px`;
	img.baseWidth = `${backStickerWidthPx}px`;
	img.baseHeight = `${backStickerHeightPx}px`;

	picBodyRecto.appendChild(img);
}
const videoRect = document.getElementById('video-container').getBoundingClientRect()

video.addEventListener('click', () => drawStickers(video, videoRect.height, videoRect.height))
galleryImage.addEventListener('click', () => drawStickers(galleryImage, videoRect.height, videoRect.height))

let canvasList = []

const previewBars = [previewBar, previewBar2]
let picMiniId = 0;

for (const cameraButton of cameraButtons) {
	cameraButton.addEventListener("click", () => {
		if (cameraButton.classList.contains("blocked"))
			return

		trackEvent("editor-photo-capture");

		// Dessine la photo prise
		context.save();
		context.scale(-1, 1);
		context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
		context.restore();

		const squareCanvas = document.createElement('canvas');
		const squareContext = squareCanvas.getContext('2d');
		const galleryCanvas = document.createElement('canvas');
		const galleryContext = galleryCanvas.getContext('2d');

		if (video.style.display === 'block') {
			// Crop la photo (rectangle -> carré)
			squareCanvas.width = PICSIZE;
			squareCanvas.height = PICSIZE;

			const offsetX = (canvas.width - PICSIZE) / 2;
			const offsetY = (canvas.height - PICSIZE) / 2;
	
			squareContext.drawImage(canvas, offsetX, offsetY, PICSIZE, PICSIZE, 0, 0, PICSIZE, PICSIZE);
		}
		else if (galleryImage.style.display === 'block') {
			galleryCanvas.width = galleryImage.naturalWidth;
			galleryCanvas.height = galleryImage.naturalHeight;

			const offsetX = (galleryImage.naturalWidth - PICSIZE) / 2;
			const offsetY = (galleryImage.naturalHeight - PICSIZE) / 2;

			galleryContext.drawImage(galleryImage, offsetX, offsetY, PICSIZE, PICSIZE, 0, 0, PICSIZE, PICSIZE);
		}

		// Data des stickers a placer
		const stickersToDraw = Array.from(document.querySelectorAll('.pic-body-recto .sticker'))

		const stickersData = stickersToDraw.map(sticker => {
			return {
				src: sticker.src,
				left: sticker.baseLeft,
				top: sticker.baseTop,
				// width: sticker.baseWidth,
				// height: sticker.baseHeight
			}
		});

		function copyCanvas(originalCanvas) {
			const newCanvas = document.createElement('canvas');
			newCanvas.width = originalCanvas.width;
			newCanvas.height = originalCanvas.height;
			const ctx = newCanvas.getContext('2d');
			ctx.drawImage(originalCanvas, 0, 0);
			return newCanvas;
	  }

		if (video.style.display === 'block') {
			canvasList.push({
				stickersData: stickersData,
				canvas: copyCanvas(squareCanvas),
				id: picMiniId
			})
		}
		else if (galleryImage.style.display === 'block') {
			canvasList.push({
				stickersData: stickersData,
				canvas: copyCanvas(galleryCanvas),
				id: picMiniId
			})
		}

		stickersToDraw.forEach(sticker => {
			const x = parseFloat(sticker.baseLeft);
			const y = parseFloat(sticker.baseTop);
			const width = parseFloat(sticker.baseWidth);
			const height = parseFloat(sticker.baseHeight);

			if (video.style.display === 'block')
				squareContext.drawImage(sticker, x, y, width, height);
			else if (galleryImage.style.display === 'block')
				galleryContext.drawImage(sticker, x, y, width, height);
		});

		let imageDataPreview
		if (video.style.display === 'block')
			imageDataPreview = squareCanvas.toDataURL('image/png');
		else if (galleryImage.style.display === 'block')
			imageDataPreview = galleryCanvas.toDataURL('image/png');

		for (const bar of previewBars) {
			const picMini = createPicMini(imageDataPreview, picMiniId)

			const preview = picMini.querySelector(".preview");
			preview.addEventListener('click', async () => {
				previewImage.src = imageDataPreview;

				await handlePanel('preview')
			})

			bar.appendChild(picMini)
		}
		picMiniId++
		picCount++

		if (picCount >= 5) {
			for (const button of cameraButtons) {
				button.classList.add('blocked')
			}
		}
		else if (!demo) {
			for (const button of publishButtons) {
				button.classList.remove('blocked')
			}
		}
	});
}

for (const publishButton of publishButtons) {
	
	publishButton.addEventListener("click", async () => {
		if (demo || publishButton.classList.contains("blocked"))
			return

		const formData = new FormData()
		const promises = [];

		canvasList.forEach((canvas, index) => {
			const promise = new Promise((resolve, reject) => {
				formData.append(`stickersData_${index}`, JSON.stringify(canvas.stickersData));

				canvas.canvas.toBlob((blob) => {
					if (blob) {
							formData.append(`canvas_${index}`, blob, `canvas_${index}.png`);
							resolve();
					}
					else {
						reject(new Error('Failed to create blob'));
					}
				}, 'image/png', 1);
			});
  
			promises.push(promise);
		});

		try {
			await Promise.all(promises);

			const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

			const xhr = new XMLHttpRequest();
			xhr.open('POST', `/create`, true);
			xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
			xhr.setRequestHeader('Pragma', 'no-cache');
			xhr.setRequestHeader('X-CSRF-Token', csrfToken);
		
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 201) {
						trackEvent("pic-create", { count: canvasList.length });
						window.location.href = "/";
					}
					else {
						const response = JSON.parse(xhr.responseText);
						console.error(response.message);
					}
				}
			};

			xhr.send(formData);
		}
		catch (error) {
			console.error(error)
		}
	})
}

function clearStickers() {
	const currentStickers = picBodyRecto.querySelectorAll('.sticker');

	currentStickers.forEach((sticker) => {
		picBodyRecto.removeChild(sticker);
  	});

	stickerSelected = null

  	video.style.cursor = 'default'
  	galleryImage.style.cursor = 'default'
}

/* BUTTONS */

const stickersButton = document.getElementById('stickers-button')
const previewsButton = document.getElementById('previews-button')
const stickers = document.getElementById('stickers')
const previews = document.getElementById('previews')

stickers.classList.add("show")
stickersButton.addEventListener('click', () => {
	stickers.classList.add("show")
	previews.classList.remove("show")
})
previewsButton.addEventListener('click', () => {
	previews.classList.add("show")
	stickers.classList.remove("show")
})

const logo = document.querySelector('.logo');
const mobileHomeButton = document.getElementById('mobile-home-button');
const cancelButtons = document.getElementsByClassName('cancel-button');
const returnHomeButtons = [
	logo,
	mobileHomeButton,
	...cancelButtons
]
returnHomeButtons.forEach((button) => {
	button?.addEventListener('click', () => {
		window.location.href = "/";
	})
})