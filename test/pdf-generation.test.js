import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import { createServer } from "node:http";
import { after, before, test } from "node:test";
import { PercollateService } from "../dist/services/percollate.service.js";

const formats = [
	{ name: "A4", value: "a4", width: 595, height: 842 },
	{ name: "A5", value: "a5", width: 420, height: 595 },
];
const fontSizes = [10, 12, 16];
const pagesPerSide = [1, 2, 4];

let server;
let sourceUrl;
let service;

before(async () => {
	const html = `<!doctype html><html><head><title>PDF test fixture</title></head><body>
		<h1>PDF generation test</h1>
		${Array.from(
			{ length: 120 },
			(_, index) =>
				`<p>Test paragraph ${
					index + 1
				}: This content verifies PDF layout and pagination.</p>`,
		).join("")}
	</body></html>`;

	server = createServer((_request, response) => {
		response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
		response.end(html);
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	sourceUrl = `http://127.0.0.1:${server.address().port}/fixture.html`;
	service = await PercollateService.init();
});

after(async () => {
	await new Promise((resolve, reject) =>
		server.close((error) => (error ? reject(error) : resolve())),
	);
});

async function generatePdf(format, fontsize, pages) {
	const result = await service.run([sourceUrl], "pdf", pages, {
		author: "",
		css: "",
		format,
		fontsize,
	});
	const buffer = await readFile(result.file);
	return { result, buffer };
}

function pdfInfo(buffer) {
	const output = execFileSync("pdfinfo", ["-"], {
		input: buffer,
		encoding: "utf8",
	});
	const pageSize = output.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
	const pages = output.match(/Pages:\s+(\d+)/);
	assert.ok(pageSize, "PDF must contain page dimensions");
	assert.ok(pages, "PDF must contain a page count");
	return {
		width: Number(pageSize[1]),
		height: Number(pageSize[2]),
		pages: Number(pages[1]),
	};
}

for (const format of formats) {
	for (const fontsize of fontSizes) {
		test(`${format.name} PDF with ${fontsize}pt font`, async () => {
			const { result, buffer } = await generatePdf(format.value, fontsize, 1);
			try {
				assert.equal(buffer.subarray(0, 5).toString(), "%PDF-");
				const info = pdfInfo(buffer);
				assert.ok(Math.abs(info.width - format.width) < 2);
				assert.ok(Math.abs(info.height - format.height) < 2);
				assert.ok(info.pages > 0);
			} finally {
				await unlink(result.file);
			}
		});
	}
}

for (const pages of pagesPerSide) {
	test(`${pages} pages per side`, async () => {
		const { result, buffer } = await generatePdf("a4", 12, pages);
		try {
			const info = pdfInfo(buffer);
			assert.ok(info.pages > 0);
			if (pages > 1) {
				assert.ok(
					info.pages < 120,
					"N-up PDF should contain fewer pages than the source layout",
				);
			}
		} finally {
			await unlink(result.file);
		}
	});
}
