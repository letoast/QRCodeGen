<script lang="ts">
	import { onMount } from 'svelte';
	import { form, postOfficeNumbers, errors, handleChange } from '$stores/createForm';

	// Components
	import Autocomplete from 'simple-svelte-autocomplete';

	let selectInputRef, selectValue;
	const handleSelectChange = (type: string) => {
		if (selectInputRef) {
			if (type === 'change') {
				selectInputRef.value = selectValue;
				$form.kraj_prejemnika = selectValue;
			} else if (type === 'blur') {
				$form.kraj_prejemnika = selectInputRef.value;
			}
			if (selectValue === undefined) {
				$form.kraj_prejemnika = '';
				console.log($form.kraj_prejemnika);
			}
			handleChange({ target: selectInputRef } as Event);
		}
	};

	onMount(async () => {
		selectInputRef = document.querySelector('input[name="kraj_prejemnika"]');
		selectInputRef.inputMode = 'numeric';
		selectInputRef.pattern = '[0-9]*';
		selectInputRef.maxLength = '4';
	});
</script>

<div>
	<label for="kraj_prejemnika" class="form-label">🏤 Poštna številka</label>
	<Autocomplete
		bind:value={selectValue}
		onBlur={() => handleSelectChange('blur')}
		onChange={() => handleSelectChange('change')}
		onFocus={() => handleSelectChange('focus')}
		items={postOfficeNumbers}
		selectedItem={postOfficeNumbers[
			postOfficeNumbers.findIndex((item) => item === $form.kraj_prejemnika)
		] || ''}
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
