<script context="module">
	export const ssr = false;
	import Modal from 'sv-bootstrap-modal';
</script>

<script lang="ts">
	import '$scss/app.scss';
	import { onMount } from 'svelte';
	import { posteSlovenija } from '$lib/posteSlovenija';
	import { convertAccentedCharacters } from '$lib/convertAccentedCharacters';
	import { shareFile } from '$lib/shareFile';
	import { dataURLToGIF } from '$lib/dataURLToGIF';

	import { encode } from 'upnqr';
	import qrcode from 'qrcode-generator';
	import { createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import validator from 'validator';

	import Autocomplete from 'simple-svelte-autocomplete';
	import InputMask from '$components/InputMask.svelte';

	// let Modal;
	let isOpen = false;

	// DATE OF PAYMENT
	const formatDate = (date: Date): string => {
		const [day, month, year] = date
			.toLocaleString('sl-SI')
			.replaceAll(' ', '')
			.substr(0, 10)
			.match(/\d+/g);
		return `${year}-${month}-${day}`;
	};

	$: setDate = (e: Event) => {
		// console.log(new Date((<HTMLInputElement>e.target)?.value).toISOString());
		$form.date = new Date((<HTMLInputElement>e.target)?.value);
	};

	// POST OFFICE
	// const postOfficeNumbers = posteSlovenija
	// 	.sort((a, b) => parseInt(a.postNumber) - parseInt(b.postNumber))
	// 	.map(({ postNumber, town }) => `${postNumber} ${town}`);
	const postOfficeNumbers = posteSlovenija
		.sort((a, b) => parseInt(a.postNumber) - parseInt(b.postNumber))
		.map(({ postNumber }) => postNumber);

	const { form, errors, state, isValid, validateField, handleChange, handleSubmit } = createForm({
		initialValues: {
			ime_prejemnika: localStorage.getItem('ime_prejemnika') || '',
			ulica_prejemnika: localStorage.getItem('ulica_prejemnika') || '',
			kraj_prejemnika: localStorage.getItem('kraj_prejemnika') || '',
			IBAN_prejemnika: localStorage.getItem('IBAN_prejemnika') || '',
			referenca_prejemnika_part1: 'SI00',
			referenca_prejemnika_part2: '',
			koda_namena: 'OTHR',
			namen_placila: localStorage.getItem('namen_placila') || 'NAKAŽI MI DENAR',
			date: new Date(),
			znesek: 10
		},
		validationSchema: yup.object().shape({
			ime_prejemnika: yup.string().required('Ime in priimek je potrebno vnesti'),
			ulica_prejemnika: yup.string().required('Ulico je potrebno vnesti'),
			kraj_prejemnika: yup
				.string()
				.oneOf(postOfficeNumbers, 'Vnesite obstoječo poštno številko')
				.required('Poštno številko je potrebno vnesti'),
			IBAN_prejemnika: yup
				.string()
				.test('TRR prejemnika', 'Vnesite veljaven TRR', (val) => validator.isIBAN(val))
				.required(),
			referenca_prejemnika_part1: yup.string().oneOf(['SI00', 'SI99']).required(),
			referenca_prejemnika_part2: yup.string().when('referenca_prejemnika_part1', {
				is: 'SI00',
				then: yup.string().required('Za SI00 je potrebna referenca'),
				otherwise: yup.string().nullable()
			}),
			koda_namena: yup.string().required(),
			namen_placila: yup.string().required('Namen plačila je potrebno vnesti'),
			date: yup
				.date()
				.min(new Date(new Date().setHours(0, 0, 0, 0)))
				.required(),
			znesek: yup
				.number()
				.typeError('Znesek je potrebno vnesti')
				.min(1, 'Najmanjši znesek je 1€')
				.required()
		}),
		onSubmit: (values) => {
			// alert(JSON.stringify(values));
			// console.log(new Date(values.date));
			generateQR(values);
		}
	});

	let qrCodeDataURL;
	const generateQR = async ({
		znesek,
		koda_namena,
		namen_placila,
		date,
		IBAN_prejemnika,
		referenca_prejemnika_part1,
		referenca_prejemnika_part2,
		ime_prejemnika,
		ulica_prejemnika,
		kraj_prejemnika
	}) => {
		// console.log(
		// 	`${kraj_prejemnika} ${convertAccentedCharacters(
		// 		posteSlovenija
		// 			.find(({ postNumber }) => parseInt(postNumber) === kraj_prejemnika)
		// 			.town.toUpperCase()
		// 	)}`
		// );
		try {
			const result = encode({
				slog: 'UPNQR',
				polog: false,
				dvig: false,
				ime_placnika: '',
				ulica_placnika: '',
				kraj_placnika: '',
				znesek: znesek,
				nujno: true,
				koda_namena,
				namen_placila,
				rok_placila: new Date(date),
				IBAN_prejemnika,
				referenca_prejemnika: `${referenca_prejemnika_part1}${
					referenca_prejemnika_part1 === 'SI00' ? ` ${referenca_prejemnika_part2}` : ''
				}`,
				ime_prejemnika,
				ulica_prejemnika,
				kraj_prejemnika: `${kraj_prejemnika} ${convertAccentedCharacters(
					posteSlovenija.find(({ postNumber }) => postNumber === kraj_prejemnika).town.toUpperCase()
				)}`,
				rezerva: 'dodatek do skupaj 411 znakov'
			});
			const qr = qrcode(15, 'M');
			qr.addData(result, 'Byte');
			qr.make();
			qrCodeDataURL = qr.createDataURL(4, 16);
			isOpen = true;
		} catch (error) {
			console.log(error);
		}
	};

	const shareQR = async () => {
		const qrCodeFile = await dataURLToGIF(qrCodeDataURL, 'qrCode.GIF');
		await shareFile({ file: qrCodeFile, title: 'Nakazi mi', text: 'Moja QR koda za nakazilo' });
	};

	const saveToLocalStorage = () => {
		const storageObject = {
			namen_placila: $form.namen_placila,
			IBAN_prejemnika: $form.IBAN_prejemnika,
			ime_prejemnika: $form.ime_prejemnika,
			ulica_prejemnika: $form.ulica_prejemnika,
			kraj_prejemnika: $form.kraj_prejemnika
		};
		for (const key in storageObject) {
			localStorage.setItem(key, storageObject[key]);
		}
		hasLocalStorage = checkLocalStorage();
	};

	const deleteLocalStorage = () => {
		localStorage.clear();
		$form.namen_placila = '';
		$form.IBAN_prejemnika = '';
		$form.ime_prejemnika = '';
		$form.ulica_prejemnika = '';
		$form.kraj_prejemnika = '';
		hasLocalStorage = checkLocalStorage();
	};

	const checkLocalStorage = () => {
		const storageKeys = [
			'namen_placila',
			'IBAN_prejemnika',
			'ime_prejemnika',
			'ulica_prejemnika',
			'kraj_prejemnika'
		];
		return !!storageKeys.map((key) => localStorage.getItem(key)).filter(Boolean).length;
	};
	let hasLocalStorage = checkLocalStorage();

	let selectInputRef, selectValue;

	const handleSelectChange = (type: string) => {
		if (selectInputRef) {
			if (type === 'change') {
				selectInputRef.value = selectValue;
				$form.kraj_prejemnika = selectValue;
			} else if (type === 'blur') {
				$form.kraj_prejemnika = selectInputRef.value;
			}
			// @ts-ignore
			handleChange({ target: selectInputRef });
		}
	};

	onMount(async () => {
		selectInputRef = document.querySelector('input[name="kraj_prejemnika"]');
		selectInputRef.inputMode = 'numeric';
		selectInputRef.pattern = '[0-9]*';
		selectInputRef.maxLength = '4';
	});
</script>

<main>
	<section class="container px-3 my-4">
		<div class="row justify-content-center">
			<div class="col col-sm-8 col-md-7 col-lg-5 col-xxl-4">
				<h2 class="fw-bold mb-4">Naredi UPN QR kodo</h2>
				<form on:submit|preventDefault={handleSubmit} class="d-grid gap-3 needs-validation">
					<div>
						<label for="ime_prejemnika" class="form-label">📇 Ime in Priimek</label>

						<InputMask
							on:blur={handleChange}
							bind:value={$form.ime_prejemnika}
							unmask="typed"
							imask={{
								mask: function (str) {
									return /^[a-zčšžćđA-ZČŠŽĆĐ\s]+$/.test(str);
								},
								prepare: function (str) {
									return convertAccentedCharacters(str.toUpperCase());
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
						<label for="street-address" class="form-label">🗺️ Ulica</label>

						<InputMask
							on:blur={handleChange}
							bind:value={$form.ulica_prejemnika}
							unmask="typed"
							imask={{
								mask: function (str) {
									return /^[a-zčšžćđA-ZČŠŽĆĐ][a-zčšžćđA-ZČŠŽĆĐ0-9\/\s]*$/.test(str);
								},
								prepare: function (str) {
									return convertAccentedCharacters(str.toUpperCase());
								}
							}}
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
						<label for="kraj_prejemnika" class="form-label">🏤 Poštna številka</label>
						<Autocomplete
							bind:value={selectValue}
							onBlur={() => handleSelectChange('blur')}
							onChange={() => handleSelectChange('change')}
							onFocus={() => handleSelectChange('focus')}
							items={postOfficeNumbers}
							selectedItem={postOfficeNumbers.find(
								(item) => item === localStorage.getItem('kraj_prejemnika')
							) || ''}
							hideArrow={true}
							showClear={!!$form.kraj_prejemnika}
							name="kraj_prejemnika"
							placeholder="1000"
							noResultsText="Ni rezultatov 😥"
							inputClassName="form-control"
							inputId="kraj_prejemnika"
						/>
						{#if $errors.kraj_prejemnika}
							<small>{$errors.kraj_prejemnika}</small>
						{/if}
					</div>

					<div>
						<label for="iban" class="form-label">🏦 TRR</label>
						<InputMask
							on:blur={handleChange}
							on:keyup={handleChange}
							on:customFocus={({ detail: { maskRef } }) => maskRef.updateOptions({ lazy: false })}
							on:customBlur={({ detail: { maskRef } }) => maskRef.updateOptions({ lazy: true })}
							on:paste={(e) =>
								($form.IBAN_prejemnika = e.clipboardData.getData('text').replace('SI56', ''))}
							bind:value={$form.IBAN_prejemnika}
							name="IBAN_prejemnika"
							inputmode="numeric"
							unmask="typed"
							imask={{
								mask: 'SI56 0000 0000 0000 000'
							}}
							placeholder="SI56 1920 0123 4567 892"
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
								on:change={() => validateField('referenca_prejemnika_part2')}
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
									placeholder={new Date().toLocaleString().substr(0, 10).replace(/\//g, '')}
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

						<InputMask
							on:blur={handleChange}
							bind:value={$form.namen_placila}
							unmask="typed"
							imask={{
								mask: /^[[a-zčćđšžA-ZČĆĐŠŽ\s]+$/,
								prepare: function (str) {
									return convertAccentedCharacters(str.toUpperCase());
								}
								// commit: function (value, masked) {
								// 	// console.log(value);
								// 	masked.value = convertAccentedCharacters(value);
								// 	// return value;
								// }
							}}
							placeholder="NAKAZI MI DENAR"
							name="namen_placila"
							type="text"
							class="form-control"
						/>
						{#if $errors.namen_placila}
							<small>{$errors.namen_placila}</small>
						{/if}
					</div>

					<div>
						<label for="rok-placila" class="form-label">📅 Rok plačila</label>

						<input
							on:blur={handleChange}
							on:change={setDate}
							value={formatDate(new Date())}
							min={formatDate(new Date())}
							name="date"
							type="date"
							class="form-control"
						/>
						{#if $errors.date}
							<small>{$errors.date}</small>
						{/if}
					</div>

					<div>
						<label for="znesek" class="form-label">💵 Znesek v €</label>

						<InputMask
							on:blur={handleChange}
							on:keyup={handleChange}
							bind:value={$form.znesek}
							unmask="typed"
							imask={{
								mask: Number,
								min: 1
							}}
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
						<div class="d-flex justify-content-center align-items-center">Zgeneriraj QR 🚀</div>
					</button>
				</form>
				{#if hasLocalStorage}
					<button
						type="button"
						class="btn btn-outline-danger w-100 mt-3"
						on:click={deleteLocalStorage}
					>
						<div class="d-flex justify-content-center align-items-center">
							Izbriši lokalne podatke 🗑️
						</div>
					</button>
				{/if}
			</div>
		</div>
	</section>
	<Modal bind:open={isOpen}>
		<div class="container pt-2 px-4 pb-4">
			<div class="row justify-content-center">
				<div class="col col-sm-auto">
					<img class="qr-code-image" src={qrCodeDataURL} alt="" />
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
							Shrani podatke lokalno 💾
						</div>
					</button>
				</div>
			</div>
		</div>
	</Modal>
</main>

<style></style>
