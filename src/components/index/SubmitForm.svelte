<script lang="ts">
	import { handleSubmit, isValid } from '$stores/createForm';

	import PaymentDateField from '$components/index/SubmitForm/PaymentDateField.svelte';
	import PaymentReferenceField from '$components/index/SubmitForm/PaymentReferenceField.svelte';
	import PaymentPurposeField from '$components/index/SubmitForm/PaymentPurposeField.svelte';
	import PaymentIBANField from '$components/index/SubmitForm/PaymentIBANField.svelte';
	import PaymentPostNumberField from '$components/index/SubmitForm/PaymentPostNumberField.svelte';
	import PaymentAmountField from '$components/index/SubmitForm/PaymentAmountField.svelte';
	import PaymentStreetField from '$components/index/SubmitForm/PaymentStreetField.svelte';
	import PaymentFullNameField from '$components/index/SubmitForm/PaymentFullNameField.svelte';
</script>

<form on:submit|preventDefault={handleSubmit} class="d-grid gap-3 needs-validation">
	<PaymentFullNameField />

	<PaymentStreetField />
	<PaymentPostNumberField />

	<PaymentIBANField />
	<PaymentReferenceField />

	<!-- <div>
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
					</div> -->

	<PaymentPurposeField />
	<PaymentDateField />
	<PaymentAmountField />

	<button type="submit" class="btn btn-primary mt-3" disabled={!$isValid}>
		<div class="d-flex justify-content-center align-items-center">Zgeneriraj QR 🚀</div>
	</button>
</form>
