import {
  Controller,
  Get,
  OnModuleInit,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { PercollateService } from './percollate.service';

import * as path from 'path';
import * as makeDir from 'make-dir';

const basePath = path.resolve(__dirname + '/../../cache');

@Controller()
export class PercollateController implements OnModuleInit {
  constructor(private readonly percollateService: PercollateService) {}

  @Get(':method')
  async get(
    @Res() response,
    @Req() request,
    @Param('method') method,
    @Query('url') urls,
    @Query() options,
  ) {
    const filteredQuery = options;
    delete filteredQuery.url;
    delete filteredQuery.output;
    const parsedUrls = Array.isArray(urls) ? urls : [urls];

    if (['pdf', 'epub', 'html', 'md'].indexOf(method) > -1) {
       const { file, title } = await this.percollateService.run(parsedUrls, method, options);
      await this.handleRequest(file, title, method, response, request);
    }
  }

  async handleRequest(file, title, method,  response, request) {
    response.set('Content-Disposition', 'inline; filename=' + encodeURI(title) + '.' + method + '; filename*=UTF-8\'\'' + encodeURI(title) + '.' + method);
    await response.sendFile(file);
    request.on('end', async () => {
      await this.percollateService.cleanupOld();
    });
  }

  onModuleInit(): any {
    makeDir(basePath);
  }
}
