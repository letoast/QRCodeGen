<script context="module">
	// export const ssr = false;
	import Modal from 'sv-bootstrap-modal';
</script>

<script lang="ts">
	import { saveToLocalStorage, shareQR, qrCodeDataURL, isOpen } from '$stores/createForm';
</script>

<Modal bind:open={$isOpen}>
	<div class="container pt-2 px-4 pb-4">
		<div class="row justify-content-center">
			<div class="col col-sm-auto">
				<img class="qr-code-image" src={$qrCodeDataURL} alt="" />
			</div>
		</div>
		<div class="row justify-content-center">
			<div class="col">
				<button type="button" class="btn btn-primary w-100 mt-3" on:click={shareQR}>
					<div class="d-flex justify-content-center align-items-center">Deli QR 💸</div>
				</button>
			</div>
		</div>
		<div class="row justify-content-center">
			<div class="col">
				<button
					type="button"
					class="btn btn-outline-primary w-100 mt-3"
					on:click={saveToLocalStorage}
				>
					<div class="d-flex justify-content-center align-items-center">
						Shrani vnešene podatke 💾
					</div>
				</button>
			</div>
		</div>
	</div>
</Modal>
