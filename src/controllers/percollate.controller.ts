import { Request, Response, NextFunction } from "express";
import { PercollateService } from "../services/percollate.service.js";

export interface Options {
	author: string;
	css: string;
}

interface LoadRequest {
	url: string[] | string;
	pagesperside: number;
	options: Options;
}

interface RequestParams {
	method: string;
}

const percollateService = await PercollateService.init();

class PercollateController {
	constructor() {
		this.register = this.register.bind(this);
	}

	handleRequest(
		file: string,
		title: string,
		method: string,
		response: Response,
		request: Request<RequestParams, object, object, LoadRequest>,
	) {
		response.attachment(`${title}.${method}`);
		response.sendFile(file);
		request.on("end", () => {
			percollateService.cleanupOld();
		});
	}

	async register(
		req: Request<RequestParams, object, object, LoadRequest>,
		res: Response,
		next: NextFunction,
	) {
		const { url, options, pagesperside } = req.query;

		const parsedUrls: string[] = Array.isArray(url) ? url : [url];

		const { file, title } = await percollateService.run(
			parsedUrls,
			req.params.method,
			pagesperside,
			options || {},
		);
		await this.handleRequest(file, title, req.params.method, res, req);
	}
}

export default new PercollateController();
