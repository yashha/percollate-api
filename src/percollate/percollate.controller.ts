import { Controller, Get, HttpException, HttpStatus, OnModuleInit, Param, Query, Req, Res } from '@nestjs/common';
import * as makeDir from 'make-dir';
import * as path from 'path';
import { PercollateService } from './percollate.service';


const basePath = path.resolve(__dirname + '/../../cache');

@Controller()
export class PercollateController implements OnModuleInit {
  constructor(private readonly percollateService: PercollateService) {}

  @Get('load.:method')
  async get(
    @Res() response,
    @Req() request,
    @Param('method') method,
    @Query('url') urls,
    @Query('pagesperside') pagesPerSide: number,
    @Query() options,
  ) {
    const filteredQuery = options;
    delete filteredQuery.url;
    delete filteredQuery.output;
    const parsedUrls = Array.isArray(urls) ? urls : [urls];

    try {
      if (['pdf', 'epub', 'html', 'md'].indexOf(method) > -1) {
        const { file, title } = await this.percollateService.run(parsedUrls, method, pagesPerSide, options);
        await this.handleRequest(file, title, method, response, request);
      }
    } catch (error) {
      console.error(error);
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  async handleRequest(file, title, method,  response, request) {
    response.set('Content-Disposition', 'inline; filename='
      + encodeURI(title)
      + '.'
      + method
      + '; filename*=UTF-8\'\''
      + encodeURI(title)
      + '.'
      + method);
    await response.sendFile(file);
    request.on('end', async () => {
      await this.percollateService.cleanupOld();
    });
  }

  onModuleInit(): any {
    makeDir(basePath);
  }
}
