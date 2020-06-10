import percollate from 'percollate-fork';

async function ssr() {
	const testPdf = `./test.pdf`;
	try {
		await percollate.pdf(['https://de.wikipedia.org/wiki/JavaScript'], {
			output: testPdf,
			sandbox: false
		});
	} catch (e) {
		console.log(e.message);
	}
}

export { ssr as default };
