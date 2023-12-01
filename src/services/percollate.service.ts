import childProcess from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import makeDir from "make-dir";
import * as percollate from "percollate";
import { v5 as uuidv5 } from "uuid";
import { Options } from "../controllers/percollate.controller.js";

const execFile = util.promisify(childProcess.execFile);

const basePath = new URL("../../cache", import.meta.url).pathname;

export class PercollateService {
	static async init() {
		const percollateService = new PercollateService();
		await makeDir(basePath);
		return percollateService;
	}

	async run(
		urls: string[],
		method: string,
		pagesPerSide: number,
		options: Options,
	) {
		const filename = `${uuidv5(
			JSON.stringify(urls) + JSON.stringify(options) + pagesPerSide,
			uuidv5.URL,
		)}.${method}`;
		const file = path.resolve(basePath, filename);
		let result = null;

		percollate.configure();

		options.author = "";

		switch (method) {
			case "pdf":
				options.css += `
          div > figure {
            width: 30%;
            float: right;
            margin-left: 30px !important;
          }
        `;
				result = await percollate.pdf(urls, {
					output: file,
					sandbox: false,
					hyphenate: true,
					template: new URL(
						"../../static/default-template.html",
						import.meta.url,
					).pathname,
					...options,
				});

				//await this.convertPagesPerSide(file, pagesPerSide);

				break;
			case "epub":
				result = await percollate.epub(urls, {
					output: file,
					sandbox: false,
					hyphenate: false,
					template: new URL(
						"../../static/default-template.html",
						import.meta.url,
					).pathname,
					...options,
				});
				break;
			case "html":
				options.css += `
          .article {
            max-width: 40rem;
            margin: 2rem auto;
          }
        `;
				result = await percollate.html(urls, {
					output: file,
					sandbox: false,
					hyphenate: false,
					template: new URL(
						"../../static/default-template.html",
						import.meta.url,
					).pathname,
					...options,
				});
				break;
		}

		if (urls.length > 0 && result && result.items.length > 0) {
			return { file, title: result.items[0].title };
		}

		return { file };
	}

	async convertPagesPerSide(file: string, pages: number) {
		const orientation: Record<number, string> = {
			2: "landscape",
			4: "portrait",
			// 6: "landscape",
			// 9: "portrait",
			// 16: "portrait",
		};

		const mode: Record<number, string> = {
			2: "2x1",
			4: "2x2",
			// 6: "3x2",
			// 9: "3x3",
			// 16: "4x4",
		};

		console.log(orientation[pages]);
		console.log(mode[pages]);
		if (orientation[pages] && mode[pages]) {
			const noLandscape = orientation[pages] === "portrait";
			const nup = mode[pages];
			await this.convertNup(file, nup, noLandscape);
		}
	}

	async convertNup(file: string, nup = "2x1", noLandscape = false) {
		const noLandscapeAttribute = noLandscape ? "--no-landscape" : "";
		const cmd = "pdfnup";
		const args = ["---nup", file, noLandscapeAttribute, "--outfile", file];
		const { stdout, stderr } = await execFile(cmd, args);
		console.log(stdout, nup);
		console.log(stderr);
		return file;
	}

	deleteFilesOlderThan(directory: string, time: number) {
		fs.readdir(directory, (readDirError, files) => {
			for (const file of files) {
				fs.stat(path.join(directory, file), (statError, stat) => {
					if (statError) {
						return console.error(statError);
					}
					const now = new Date().getTime();
					const endTime = new Date(stat.ctime).getTime() + time;
					if (now > endTime) {
						return fs.unlinkSync(path.join(directory, file));
					}
				});
			}
		});
	}

	cleanupOld() {
		this.deleteFilesOlderThan(basePath, 60 * 60 * 1000);
	}
}
