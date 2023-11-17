import { Controller, Get, HttpException, HttpStatus, OnModuleInit, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import makeDir from 'make-dir';
import { PercollateService } from './percollate.service.js';


const basePath = (new URL('../../cache', import.meta.url)).pathname;

@Controller()
export class PercollateController implements OnModuleInit {
  constructor(private readonly percollateService: PercollateService) {}

  @Get('load.:method')
  async get(
    @Res() response: Response,
    @Req() request: Request,
    @Param('method') method: string,
    @Query('url') urls: string[],
    @Query('pagesperside') pagesPerSide: number,
    @Query() options: Record<string,string>,
  ) {
    const filteredQuery = options;
    delete filteredQuery.url;
    delete filteredQuery.output;
    const parsedUrls = Array.isArray(urls) ? urls : [urls];

    try {
      if (['pdf', 'epub', 'html'].indexOf(method) > -1) {
        const { file, title } = await this.percollateService.run(parsedUrls, method, pagesPerSide, options);
        await this.handleRequest(file, title, method, response, request);
      }
    } catch (error: any) {
      const message = process.env.NODE_ENV === 'production' ? 'Forbidden' : error.message;
      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }

  async handleRequest(file: string, title: string, method: string, response: Response, request: Request) {
    response.attachment(`${title}.${method}`)
    await response.sendFile(file);
    request.on('end', async () => {
      await this.percollateService.cleanupOld();
    });
  }

  onModuleInit(): any {
    makeDir(basePath);
  }
}
