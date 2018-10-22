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

  @Get('api')
  async get(
    @Res() response,
    @Req() request,
    @Query('url') urls,
    @Query() options,
  ) {
    const filteredQuery = options;
    delete filteredQuery.url;
    delete filteredQuery.output;
    const parsedUrls = Array.isArray(urls) ? urls : [urls];

    await this.percollateService.api(parsedUrls, options, response, request);
  }

  @Post('api')
  async post(
    @Res() response,
    @Req() request,
    @Param() params,
    @Query('url') urls,
  ) {
    const filteredParams = params;
    delete filteredParams.output;

    await this.percollateService.api(urls, filteredParams, response, request);
  }

  onModuleInit(): any {
    makeDir(basePath);
  }
}
