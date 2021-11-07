<script lang="ts">
	import { form, handleChange, errors } from '$stores/createForm';
	import { convertAccentedCharacters } from '$lib/convertAccentedCharacters';

	// Components
	import InputMask from '$components/InputMask.svelte';
</script>

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
