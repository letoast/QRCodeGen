<script>
	import QRCode from 'qrcode/build/qrcode';
	import { encode } from 'upnqr';

	function dataURLtoFile(dataurl, filename) {
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);

		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}

		return new File([u8arr], filename, { type: mime });
	}

	let {
		znesek,
		nujno,
		koda_namena,
		namen_placila,
		IBAN_prejemnika,
		referenca_prejemnika,
		ime_prejemnika,
		ulica_prejemnika,
		kraj_prejemnika,
		rezerva,
	} = {
		slog: 'UPNQR',
		polog: false,
		dvig: false,
		ime_placnika: '',
		ulica_placnika: '',
		kraj_placnika: '',
		znesek: 10,
		nujno: true,
		koda_namena: 'OTHR',
		namen_placila: 'Nakaži mi denar',
		IBAN_prejemnika: '040010000000000',
		referenca_prejemnika: new Date().toISOString().substr(0, 10).replaceAll('-', ''),
		ime_prejemnika: 'Janez Novak',
		ulica_prejemnika: 'Slovenska cesta 1',
		kraj_prejemnika: '1000 Ljubljana',
		rezerva: 'dodatek do skupaj 411 znakov',
	};

	// let rok_placila = new Date();
	let danes = new Date();
	let internal;
	let dateRef;
	const getDateFromInput = (x) => (x ? x.valueAsDate : new Date());
	$: getDateFromInput(dateRef);

	const input = (x) => (internal = x.toISOString().substr(0, 10));
	// const output = (x) => (date = dayjs(x, format).toDate())

	$: input(danes);
	// $: output(internal)

	// $: dateFormatted = rok_placila.toISOString().substr(0, 10);

	let qrCode;
	// const handleSubmit = () => {};
	const handleSubmit = () => {
		const result = encode({
			slog: 'UPNQR',
			polog: false,
			dvig: false,
			ime_placnika: '',
			ulica_placnika: '',
			kraj_placnika: '',
			znesek,
			nujno: true,
			koda_namena,
			namen_placila,
			rok_placila: getDateFromInput(dateRef),
			IBAN_prejemnika: `SI56${IBAN_prejemnika}`,
			referenca_prejemnika: `SI00${referenca_prejemnika}`,
			ime_prejemnika,
			ulica_prejemnika,
			kraj_prejemnika,
			rezerva: 'dodatek do skupaj 411 znakov',
		});
		const encoder = new TextEncoder();
		const finalResult = encoder.encode(result);
		QRCode.toDataURL(
			[
				{
					data: finalResult,
					mode: 'byte',
					version: 15,
					errorCorrectionLevel: 'M',
				},
			],
			function (err, url) {
				if (err) {
					console.log(err);
				} else {
					qrCode = url;
					console.log(url);
					const file = dataURLtoFile(url, 'koda.png');
					if (navigator.canShare && navigator.canShare({ files: [file] })) {
						navigator
							.share({
								files: [file],
								title: 'Title',
								text: 'https://csb-ypib0.netlify.app/',
							})
							.then(() => console.log('Share was successful.'))
							.catch((error) => console.log('Sharing failed', error));
					} else {
						console.log(`Your system doesn't support sharing files.`);
					}

					// console.log(url);
				}
			}
		);
	};
</script>

<main>
	<section class="section">
		<div class="columns">
			<div class="column">
				<form on:submit|preventDefault={handleSubmit}>
					<div class="field">
						<label for="name" class="label is-small">Ime in Priimek</label>
						<div class="control">
							<input bind:value={ime_prejemnika} name="name" autocomplete="name" type="text" class="input" />
						</div>
					</div>

					<div class="field">
						<label for="street-address" class="label is-small">Ulica</label>
						<div class="control">
							<input
								bind:value={ulica_prejemnika}
								name="street-address"
								autocomplete="street-address"
								type="text"
								class="input"
							/>
						</div>
					</div>

					<div class="field">
						<label for="address-level2" class="label is-small">Pošta</label>
						<div class="control">
							<input
								bind:value={kraj_prejemnika}
								name="address-level2"
								autocomplete="address-level2"
								type="text"
								class="input"
							/>
						</div>
					</div>

					<label for="iban" class="label is-small">IBAN</label>
					<div class="field has-addons">
						<p class="control">
							<span class="button is-static">SI56</span>
						</p>
						<div class="control">
							<input
								bind:value={IBAN_prejemnika}
								on:input={(event) => {
									const val = event.target.value.replace(/(?![0-9])./gim, '');
									IBAN_prejemnika = val;
								}}
								name="iban"
								type="text"
								class="input"
							/>
						</div>
					</div>

					<label for="referenca-prejemnika" class="label is-small">Referenca</label>
					<div class="field has-addons">
						<p class="control">
							<span class="button is-static">SI00</span>
						</p>
						<div class="control">
							<input bind:value={referenca_prejemnika} name="referenca-prejemnika" type="text" class="input" />
						</div>
					</div>

					<div class="field">
						<label for="koda-namena" class="label is-small">Koda namena plačila</label>
						<div class="control">
							<input bind:value={koda_namena} name="koda-namena" type="text" class="input" />
						</div>
					</div>

					<div class="field">
						<label for="namen" class="label is-small">Namen plačila</label>
						<div class="control">
							<input bind:value={namen_placila} name="namen" type="text" class="input" />
						</div>
					</div>

					<div class="field">
						<label for="rok-placila" class="label is-small">Rok plačila</label>
						<div class="control">
							<input bind:value={internal} name="rok-placila" type="date" class="input" bind:this={dateRef} />
						</div>
					</div>

					<div class="field">
						<label for="znesek" class="label is-small">Znesek v €</label>
						<div class="control">
							<input bind:value={znesek} name="znesek" type="number" class="input" />
						</div>
					</div>

					<div class="control">
						<button type="submit" class="button is-primary is-medium">Zgeneriraj QR</button>
					</div>
				</form>
			</div>
			<div class="column">
				<img src={qrCode} alt="" />
			</div>
		</div>
	</section>
</main>

<style>
	.input::-webkit-outer-spin-button,
	.input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
