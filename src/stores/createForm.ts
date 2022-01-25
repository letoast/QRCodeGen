import { get, writable } from 'svelte/store';
import { browser } from '$app/env';
import * as yup from 'yup';
import { createForm } from 'svelte-forms-lib';
import validator from 'validator';
import { encode } from 'upnqr';
import qrcode from 'qrcode-generator';
import { shareFile, downloadFile } from '$lib/shareFile';
import { dataURLToGIF } from '$lib/dataURLToGIF';
import { convertAccentedCharacters } from '$lib/convertAccentedCharacters';

import { posteSlovenija } from '$lib/posteSlovenija';

export const postOfficeNumbers = posteSlovenija
	.sort((a, b) => parseInt(a.postNumber) - parseInt(b.postNumber))
	.map(({ postNumber }) => postNumber);

export const isOpen = writable(false);

const getClientLocalStorage = (item: string): string | null => {
	if (browser) {
		return localStorage.getItem(item);
	}
	return null;
};

export const qrCodeDataURL = writable('');

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
		qrCodeDataURL.set(qr.createDataURL(4, 16));
		isOpen.set(true);
	} catch (error) {
		console.log(error);
	}
};

export const shareQR = async (): Promise<void> => {
	const qrCodeFile = await dataURLToGIF(get(qrCodeDataURL), 'qrCode.gif');
	try {
		await shareFile({ file: qrCodeFile, title: 'Nakazi mi', text: 'Moja QR koda za nakazilo' });
	} catch (error) {
		console.log('Sharing failed', error);
		downloadFile(get(qrCodeDataURL), 'qrCode.gif');
	}
};

export const filesSaved = writable(false);

export const saveToLocalStorage = (): void => {
	const currentForm = get(form);
	const storageObject = {
		namen_placila: currentForm.namen_placila,
		IBAN_prejemnika: currentForm.IBAN_prejemnika,
		ime_prejemnika: currentForm.ime_prejemnika,
		ulica_prejemnika: currentForm.ulica_prejemnika,
		kraj_prejemnika: currentForm.kraj_prejemnika
	};
	localStorage.setItem('userPresets', JSON.stringify(storageObject));
	hasLocalStorage.set(checkLocalStorage());
	filesSaved.set(true);
};

export const deleteLocalStorage = (): void => {
	localStorage.clear();
	const currentForm = get(form);
	form.set({
		...currentForm,
		namen_placila: '',
		IBAN_prejemnika: '',
		ime_prejemnika: '',
		ulica_prejemnika: '',
		kraj_prejemnika: ''
	});
	hasLocalStorage.set(checkLocalStorage());
};

const checkLocalStorage = () => {
	return !!getClientLocalStorage('userPresets');
};

export const hasLocalStorage = writable(checkLocalStorage());

interface LocalStoragePresets {
	ime_prejemnika: string;
	ulica_prejemnika: string;
	kraj_prejemnika: string;
	IBAN_prejemnika: string;
	namen_placila: string;
}

const localStoragePresets: LocalStoragePresets | null = JSON.parse(
	getClientLocalStorage('userPresets')
);
export const { form, errors, state, isValid, validateField, handleChange, handleSubmit } =
	createForm({
		initialValues: {
			ime_prejemnika: localStoragePresets?.ime_prejemnika || '',
			ulica_prejemnika: localStoragePresets?.ulica_prejemnika || '',
			kraj_prejemnika: localStoragePresets?.kraj_prejemnika || '',
			IBAN_prejemnika: localStoragePresets?.IBAN_prejemnika || '',
			referenca_prejemnika_part1: 'SI00',
			referenca_prejemnika_part2: '',
			koda_namena: 'OTHR',
			namen_placila: localStoragePresets?.namen_placila || 'NAKAŽI MI DENAR',
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
				is: 'SI99',
				then: yup.string().required('Za SI00 je potrebna referenca'),
				otherwise: yup.string().nullable()
			}),
			koda_namena: yup.string().required(),
			namen_placila: yup.string().required('Namen plačila je potrebno vnesti'),
			date: yup
				.date()
				.min(new Date(new Date().setHours(0, 0, 0, 0)), 'Datum ne sme biti v preteklosti')
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
