<script lang="ts">
	import { form, handleChange, errors } from '$stores/createForm';

	// Components
	import InputMask from '$components/InputMask.svelte';
</script>

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
		inputmode="numeric"
		pattern="[0-9]*"
		placeholder="10"
		type="number"
		class="form-control"
	/>
	{#if $errors.znesek}
		<small>{$errors.znesek}</small>
	{/if}
</div>
