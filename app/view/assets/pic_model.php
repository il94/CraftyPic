<div id="pic-model" class="pic">
	<div class="pic-recto">
		<div class="pic-header model">
			<div class="pic-header-user-datas">
				<img src="<?php echo $user->avatar; ?>">
				<p><?php echo $user->username; ?></p>
			</div>
			<div class="pic-header-icons">
				<button id="trash" class="button-icon">
					<?php require ("view/assets/icons/trash.svg"); ?>
				</button>
				<button class="button-icon">
					<?php require ("view/assets/icons/more.svg"); ?>
				</button>
			</div>
		</div>
		<div class="pic-body-recto model">
			<div id="video-container">
				<video 
					id="video"
					autoplay
					playsinline
					muted
					></video>
			</div>
			<div id="camera-off">
				<p>Camera off</p>
			</div>
			<img id="gallery-image" src="" />
			<img id="preview-image" src="" />
			<canvas id="canvas" width="533.34" height="400"></canvas>
		</div>
		

		<div class="pic-footer model">
			<button class="button-icon selectable">
				<?php require ("view/assets/icons/like.svg") ?>
			</button>
			<button class="button-icon">
				<?php require ("view/assets/icons/comment.svg"); ?>
			</button>
		</div>
	</div>
</div>