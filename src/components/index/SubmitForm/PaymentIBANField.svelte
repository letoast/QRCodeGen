<script lang="ts">
	import { form, validateField, errors } from '$stores/createForm';

	// Components
	import InputMask from '$components/InputMask.svelte';
</script>

<div>
	<label for="iban" class="form-label">🏦 TRR</label>
	<InputMask
		on:blur={() => validateField('IBAN_prejemnika')}
		on:keyup={() => validateField('IBAN_prejemnika')}
		on:customFocus={({ detail: { maskRef } }) => maskRef.updateOptions({ lazy: false })}
		on:customBlur={({ detail: { maskRef } }) => maskRef.updateOptions({ lazy: true })}
		on:paste={(e) => {
			// console.log(`${e.clipboardData.getData('text')}`.replace('SI56', '').replace('si56', ''));
			$form.IBAN_prejemnika = `${e.clipboardData.getData('text')}`
				.replace('SI56', '')
				.replace('si56', '');
		}}
		bind:value={$form.IBAN_prejemnika}
		name="IBAN_prejemnika"
		inputmode="numeric"
		imask={{
			mask: '{SI56} 0000 0000 0000 000',
			commit: (value, mask) => {
				return value.replace(' ', '');
			}
		}}
		placeholder="SI56 1920 0123 4567 892"
		class="form-control"
	/>
	{#if $errors.IBAN_prejemnika}
		<small>{$errors.IBAN_prejemnika}</small>
	{/if}
</div>
