<script lang="ts">
	import { onMount, onDestroy, tick, createEventDispatcher } from 'svelte';
	import { imask as action } from '@imask/svelte';
	import IMask from 'imask';
	// const action = IMaskSvelte.imask; // REPL does not understand named import

	let input;
	export let value;
	let maskRef;
	let imask, unmask, attrs;
	const dispatch = createEventDispatcher();

	$: {
		({ imask, unmask, ...attrs } = $$props);

		if (maskRef) {
			writeValue(value);
			attrs.value = maskRef.value;
			tick().then(() => (value = getValue()));
		}
	}

	function getValue() {
		if (unmask === 'typed') return maskRef.typedValue;
		if (unmask) return maskRef.unmaskedValue;
		return maskRef.value;
	}

	function setValue(v) {
		v = v == null ? '' : v;
		if (unmask === 'typed') maskRef.typedValue = v;
		else if (unmask) maskRef.unmaskedValue = v;
		else maskRef.value = v;
	}

	function writeValue(v) {
		if (
			getValue() !== v ||
			// handle cases like Number('') === 0,
			// for details see https://github.com/uNmAnNeR/imaskjs/issues/134
			(typeof v !== 'string' && value === '' && !maskRef.el.isActive)
		) {
			setValue(v);
		}
	}

	onMount(() => {
		maskRef = IMask(input, imask);
		setValue(value);
	});

	onDestroy(() => {
		if (maskRef) maskRef.destroy();
		maskRef = undefined;
	});

	function accept({ detail: mask }) {
		value = getValue();
	}
</script>

<input
	type="text"
	bind:this={input}
	use:action={maskRef}
	{...attrs}
	on:accept={accept}
	on:accept
	on:complete
	on:blur
	on:keyup
	on:paste
	on:focus={dispatch('customFocus', { maskRef })}
	on:blur={dispatch('customBlur', { maskRef })}
/>
