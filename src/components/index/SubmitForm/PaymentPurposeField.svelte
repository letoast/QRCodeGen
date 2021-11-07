<script lang="ts">
	import { form, handleChange, errors } from '$stores/createForm';
	import { convertAccentedCharacters } from '$lib/convertAccentedCharacters';

	// Components
	import InputMask from '$components/InputMask.svelte';
</script>

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
