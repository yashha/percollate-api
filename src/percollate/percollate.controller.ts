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

    let file;
    if (['pdf', 'epub', 'html'].indexOf(method) > -1) {
      file = await this.percollateService.run(parsedUrls, method, options);
    }

    await this.handleRequest(file, response, request);
  }

  async handleRequest(file, response, request) {
    await response.sendFile(file);
    request.on('end', async () => {
      await this.percollateService.cleanupOld();
    });
  }

  @Post('pdf')
  async postPdf(
    @Res() response,
    @Req() request,
    @Param() params,
    @Query('url') urls,
  ) {
    const filteredParams = params;
    delete filteredParams.output;

    const file = await this.percollateService.run(urls, 'pdf', filteredParams);
    await this.handleRequest(file, response, request);
  }

  onModuleInit(): any {
    makeDir(basePath);
  }
}
