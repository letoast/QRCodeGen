<script lang="ts">
	import { form, handleChange, errors } from '$stores/createForm';

	// DATE OF PAYMENT
	const formatDate = (date: Date): string => {
		const [year, month, day] = date.toISOString().replace(/" "/g, '').substr(0, 10).match(/\d+/g);
		return `${year}-${month}-${day}`;
	};

	$: setDate = (e: Event) => {
		$form.date = new Date((<HTMLInputElement>e.target)?.value);
	};
</script>

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
