export async function dataURLToGIF(dataUrl: string, fileName: string): Promise<File> {
	const blob = await (await fetch(dataUrl)).blob();
	// console.log(blob);
	return new File([blob], fileName, { type: blob.type, lastModified: new Date().getTime() });
}
