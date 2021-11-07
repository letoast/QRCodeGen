<script lang="ts">
	import { form, handleChange, errors } from '$stores/createForm';
	import { convertAccentedCharacters } from '$lib/convertAccentedCharacters';

	// Components
	import InputMask from '$components/InputMask.svelte';
</script>

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
