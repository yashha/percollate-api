import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as percollate from 'percollate';

const basePath = path.resolve(__dirname + '/../../cache');

@Injectable()
export class PercollateService {
  static makeid() {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  async pdf(urls: string[], options: any) {
    const file = path.resolve(basePath, PercollateService.makeid() + '.pdf');

    percollate.configure();

    await percollate.pdf(urls, {
      output: file,
      sandbox: false,
      ...options,
    });
    return file;
  }

  async cleanup(file) {
    fs.unlinkSync(file);
  }
}
