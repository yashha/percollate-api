import { NowRequest, NowResponse } from '@vercel/node';
import chrome from 'chrome-aws-lambda';
import percollate from 'percollate-fork';

export default async (req: NowRequest, res: NowResponse) => {
  const testPdf = `./test.pdf`;
	try {
		await percollate.pdf(['https://de.wikipedia.org/wiki/JavaScript'], {
			output: testPdf,
      sandbox: false,
      chromePath: await chrome.executablePath
		});
    res.json({ name: 'John4', email: 'john@example.com' })
    return;
	} catch (e) {
		console.log(e.message);
		console.log(e.stack);
	}
  res.json({ name: 'John3', email: 'john@example.com' })
}
