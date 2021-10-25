export const shareFile = async ({
	file = undefined,
	title = 'Title',
	text = 'Text'
}: {
	file: File | undefined;
	title: string;
	text: string;
}): Promise<void> => {
	// @ts-ignore
	if (navigator.canShare && navigator.canShare({ files: [file] })) {
		try {
			await navigator.share({
				files: [file],
				title,
				text
			});
		} catch (error) {
			console.log('Sharing failed', error);
		}
	} else {
		console.log(`Your system doesn't support sharing files.`);
	}
};
