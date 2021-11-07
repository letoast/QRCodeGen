<script lang="ts">
	import { form, validateField, handleChange, errors } from '$stores/createForm';

	// Components
	import InputMask from '$components/InputMask.svelte';
</script>

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
