<script context="module">
	export const ssr = false;
</script>

<script lang="ts">
	import '$scss/app.scss';
	import { hasLocalStorage, deleteLocalStorage } from '$stores/createForm';

	import SubmitForm from '$components/index/SubmitForm.svelte';
	import ShareModal from '$components/index/ShareModal.svelte';

	let emojis = [
		'😀',
		'😁',
		'😂',
		'🤣',
		'😃',
		'😄',
		'😅',
		'😆',
		'😉',
		'😊',
		'😋',
		'😎',
		'😍',
		'🙂',
		'🤗',
		'🤩',
		'😏'
	];
</script>

<main>
	<section class="container px-3 pt-6 pt-md-8 pb-9">
		<div class="row justify-content-center">
			<div class="col col-sm-8 mb-4">
				<h2 class="text-center mb-4">💸 nakazi.cash 💸</h2>
				<p>
					Enostavno zgeneriraj UPN QR kodo za hitro deljenje in nakazovanje denarja. Podatki
					<a href="https://developer.chrome.com/docs/devtools/network/" target="_blank">
						ne bodo poslani nikamor</a
					>. Vse se zgodi lokalno, v brskalniku. Če pritisneš 'Shrani vnešene podatke', bodo
					shranjeni
					<a
						href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
						target="_blank">le v tvojem brskalniku.</a
					>
				</p>
			</div>
		</div>
		<div class="row justify-content-center">
			<div class="col col-sm-8 col-md-7 col-lg-5 col-xxl-4">
				<SubmitForm />
				{#if $hasLocalStorage}
					<button
						type="button"
						class="btn btn-outline-danger w-100 mt-3"
						on:click={deleteLocalStorage}
					>
						<div class="d-flex justify-content-center align-items-center">
							Izbriši shranjene podatke 🗑️
						</div>
					</button>
				{/if}
			</div>
		</div>
	</section>
	<ShareModal />
</main>
<footer class="container-fluid bg-dark text-light py-3">
	<div class="row">
		<div class="col text-center">
			Made with {emojis[Math.floor(Math.random() * emojis.length)]} by IG:
			<a class="text-light" href="https://www.instagram.com/ciril.tr/" target="_blank">Ciril</a>
			/ github:
			<a class="text-light" href="https://github.com/letoast" target="_blank">letoast</a>
		</div>
	</div>
</footer>

<style></style>
