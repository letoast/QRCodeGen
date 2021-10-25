<script lang="ts">
	import '$scss/app.scss';
	import { onMount } from 'svelte';
	import { encode } from 'upnqr';
	import qrcode from 'qrcode-generator';
	import { shareFile } from '$lib/shareFile';
	import { dataURLToGIF } from '$lib/dataURLToGIF';
	import InputMask from '$components/InputMask.svelte';
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import validator from 'validator';
	import { posteSlovenija } from '$lib/posteSlovenija';

	// DATE OF PAYMENT
	// const getDateFromInput = (x) => (x ? x.valueAsDate : new Date());
	$: setDate = (e: Event) => {
		$form.date = new Date((<HTMLInputElement>e.target)?.value);
	};

	// POST OFFICE
	const postOfficeNumbers = posteSlovenija
		.sort((a, b) => parseInt(a.postNumber) - parseInt(b.postNumber))
		.map(({ postNumber, town }) => `${postNumber} ${town}`);

	let qrCodeDataURL;

	const { form, errors, state, isValid, handleChange, handleSubmit } = createForm({
		initialValues: {
			ime_prejemnika: '',
			ulica_prejemnika: '',
			kraj_prejemnika: '',
			IBAN_prejemnika: '',
			referenca_prejemnika_part1: 'SI00',
			referenca_prejemnika_part2: '',
			koda_namena: 'OTHR',
			namen_placila: 'NAKAŽI MI DENAR',
			date: new Date(),
			znesek: 10
		},
		validationSchema: yup.object().shape({
			ime_prejemnika: yup.string().required('Ime in priimek je potrebno vpisati'),
			ulica_prejemnika: yup.string().required('Ulico je potrebno vpisati'),
			kraj_prejemnika: yup
				.string()
				.oneOf(postOfficeNumbers, 'Kraj prejemnika je potrebno izbrati')
				.required(),
			IBAN_prejemnika: yup
				.string()
				.test('Vpišite veljaven IBAN', (val) => validator.isIBAN(val))
				.required(),
			referenca_prejemnika_part1: yup.string().oneOf(['SI00', 'SI99']).required(),
			referenca_prejemnika_part2: yup.string().when('referenca_prejemnika_part1', {
				is: 'SI00',
				then: yup.string().required('Za SI00 je potrebna referenca')
			}),
			koda_namena: yup.string().required(),
			namen_placila: yup.string().required(),
			date: yup
				.date()
				.min(new Date(new Date().setHours(0, 0, 0, 0)))
				.required(),
			znesek: yup.number().required()
		}),
		onSubmit: (values) => {
			// alert(JSON.stringify(values));
			// console.log(new Date(values.date));
			generateQR(values);
		}
	});

	// function handleSelect(e) {
	// 	console.log(e);
	// 	$form.kraj_prejemnika = e.detail?.value ? e.detail.value : '';
	// }

	const generateQR = async (data) => {
		console.log(event);
		const result = encode({
			slog: 'UPNQR',
			polog: false,
			dvig: false,
			ime_placnika: '',
			ulica_placnika: '',
			kraj_placnika: '',
			znesek: data.znesek,
			nujno: true,
			koda_namena: data.koda_namena,
			namen_placila: data.namen_placila,
			rok_placila: new Date(data.date),
			IBAN_prejemnika: data.IBAN_prejemnika,
			referenca_prejemnika: `${data.referenca_prejemnika_part1}${
				data.referenca_prejemnika_part2.length ? ` ${data.referenca_prejemnika_part2}` : ''
			}`,
			ime_prejemnika: data.ime_prejemnika,
			ulica_prejemnika: data.ulica_prejemnika,
			kraj_prejemnika: data.kraj_prejemnika,
			rezerva: 'dodatek do skupaj 411 znakov'
		});
		const qr = qrcode(15, 'M');
		qr.addData(result, 'Byte');
		qr.make();
		qrCodeDataURL = qr.createDataURL(4, 16);
		const qrCodeFile = await dataURLToGIF(qrCodeDataURL, 'qrCode.gif');
		await shareFile({ file: qrCodeFile, title: 'Nakaži mi', text: 'Moja QR koda za nakazilo' });
	};

	onMount(() => {
		console.log($form.referenca_prejemnika_part1);
	});
</script>

<main>
	<section class="container px-4">
		<div class="row justify-content-center mb-2">
			<div class="col col-sm-8 col-md-7 col-lg-5 col-xxl-4 mt-5">
				<form on:submit|preventDefault={handleSubmit} class="d-grid gap-2 needs-validation">
					<div>
						<label for="ime_prejemnika" class="form-label">Ime in Priimek</label>

						<InputMask
							on:blur={handleChange}
							bind:value={$form.ime_prejemnika}
							unmask="typed"
							imask={{
								mask: function (str) {
									return /^[a-zčšžćđA-ZČŠŽĆĐ\s]+$/.test(str);
								},
								prepare: function (str) {
									return str.toUpperCase();
								}
							}}
							placeholder="JANEZ NOVAK"
							name="ime_prejemnika"
							autocomplete="name"
							type="text"
							class="form-control"
						/>
						{#if $errors.ime_prejemnika}
							<small>{$errors.ime_prejemnika}</small>
						{/if}
					</div>

					<div>
						<label for="street-address" class="form-label">Ulica</label>

						<input
							on:blur={handleChange}
							bind:value={$form.ulica_prejemnika}
							placeholder="SLOVENSKA CESTA 1"
							name="ulica_prejemnika"
							autocomplete="street-address"
							type="text"
							class="form-control"
						/>
						{#if $errors.ulica_prejemnika}
							<small>{$errors.ulica_prejemnika}</small>
						{/if}
					</div>

					<div>
						<label for="kraj_prejemnika" class="form-label">Kraj</label>
						<select
							on:blur={handleChange}
							on:change={handleChange}
							bind:value={$form.kraj_prejemnika}
							name="kraj_prejemnika"
							class="form-select"
							aria-label="Default select example"
							placeholder="1000 Ljubljana"
						>
							<option value="" disabled selected hidden>IZBERI KRAJ</option>
							{#each postOfficeNumbers as postOffice, index}
								<option value={postOffice} selected={index === 0}>{postOffice}</option>
							{/each}
						</select>
						{#if $errors.kraj_prejemnika}
							<small>{$errors.kraj_prejemnika}</small>
						{/if}
					</div>

					<div>
						<label for="iban" class="form-label">IBAN</label>
						<InputMask
							on:blur={handleChange}
							on:change={handleChange}
							bind:value={$form.IBAN_prejemnika}
							name="IBAN_prejemnika"
							inputmode="numeric"
							unmask="typed"
							imask={{
								mask: 'SI56 0000 0000 0000 000',
								overwrite: true
							}}
							placeholder="SI56 0400 1004 7774 720"
							class="form-control"
						/>
						{#if $errors.IBAN_prejemnika}
							<small>{$errors.IBAN_prejemnika}</small>
						{/if}
					</div>

					<div>
						<label for="referenca-prejemnika" class="form-label">Referenca</label>
						<div class="d-flex">
							<select
								bind:value={$form.referenca_prejemnika_part1}
								name="referenca_prejemnika_part1"
								class="form-select w-auto me-2"
								aria-label="Default select example"
							>
								<option value="SI00">SI00</option>
								<option value="SI99">SI99</option>
							</select>
							{#if $form.referenca_prejemnika_part1 === 'SI00'}
								<InputMask
									on:blur={handleChange}
									bind:value={$form.referenca_prejemnika_part2}
									name="referenca_prejemnika_part2"
									inputmode="numeric"
									maxlength="20"
									pattern="[0-9]*"
									unmask="typed"
									imask={{ mask: /^\d+$/ }}
									placeholder={new Date().toISOString().substr(0, 10).replace(/-/g, '')}
									class="form-control"
								/>
							{/if}
						</div>
						{#if $errors.referenca_prejemnika_part2}
							<small>{$errors.referenca_prejemnika_part2}</small>
						{/if}
					</div>

					<div>
						<label for="koda-namena" class="form-label">Koda namena plačila</label>

						<input
							on:blur={handleChange}
							bind:value={$form.koda_namena}
							placeholder="OTHR"
							name="koda_namena"
							type="text"
							class="form-control"
							readonly
						/>
						{#if $errors.koda_namena}
							<small>{$errors.koda_namena}</small>
						{/if}
					</div>

					<div>
						<label for="namen" class="form-label">Namen plačila</label>

						<input
							on:blur={handleChange}
							bind:value={$form.namen_placila}
							placeholder="NAKAŽI MI DENAR"
							name="namen_placila"
							type="text"
							class="form-control"
						/>
						{#if $errors.namen_placila}
							<small>{$errors.namen_placila}</small>
						{/if}
					</div>

					<div>
						<label for="rok-placila" class="form-label">Rok plačila</label>

						<input
							on:blur={handleChange}
							on:change={setDate}
							value={new Date().toISOString().substr(0, 10)}
							name="date"
							type="date"
							class="form-control"
						/>
						{#if $errors.date}
							<small>{$errors.date}</small>
						{/if}
					</div>

					<div>
						<label for="znesek" class="form-label">Znesek v €</label>

						<input
							on:blur={handleChange}
							bind:value={$form.znesek}
							name="znesek"
							placeholder="10"
							type="number"
							class="form-control"
						/>
						{#if $errors.znesek}
							<small>{$errors.znesek}</small>
						{/if}
					</div>

					<button type="submit" class="btn btn-primary mt-3" disabled={!$isValid}>
						<div class="d-flex justify-content-center align-items-center">
							Zgeneriraj QR
							<span class="material-icons-sharp ms-4"> qr_code_2 </span>
						</div>
						<!-- <svg
							class="ms-4"
							version="1.1"
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							viewBox="0 0 50 50"
							xml:space="preserve"
						>
							<path
								fill="currentColor"
								d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
							>
								<animateTransform
									attributeType="xml"
									attributeName="transform"
									type="rotate"
									from="0 25 25"
									to="360 25 25"
									dur="0.6s"
									repeatCount="indefinite"
								/>
							</path>
						</svg> -->
					</button>
				</form>
			</div>
		</div>
		<div class="row justify-content-center">
			<div class="col col-sm-auto">
				<img src={qrCodeDataURL} alt="" />
			</div>
		</div>
	</section>
</main>

<style></style>
