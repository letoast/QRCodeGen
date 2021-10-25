export async function dataURLToGIF(dataUrl: string, fileName: string): Promise<File> {
	const res: Response = await fetch(dataUrl);
	const blob: Blob = await res.blob();
	console.log(fileName);
	return new File([blob], fileName, { type: blob.type });
}
