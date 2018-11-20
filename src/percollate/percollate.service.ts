import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as percollate from 'percollate';
import * as filenamify from 'filenamify';
import * as Readability from 'readability';
import * as exiftool from 'node-exiftool';
import * as exiftoolBin from 'dist-exiftool';
import axios from 'axios';
import { JSDOM } from 'jsdom';

const basePath = path.resolve(__dirname + '/../../cache');

@Injectable()
export class PercollateService {
  async pdf(urls: string[], options: any) {
    const file = path.resolve(
      basePath,
      filenamify(JSON.stringify(urls) + JSON.stringify(options)) + '.pdf',
    );
    if (fs.existsSync(file)) {
      return file;
    }

    percollate.configure();

    await percollate.pdf(urls, {
      output: file,
      sandbox: false,
      ...options,
    });

    if (urls.length > 0) {
      await this.addExif(urls[0], file);
    }

    return file;
  }

  async addExif(url: string, file: string) {
    const { data } = await axios.get<string>(url);
    const document = new JSDOM(data).window.document;
    const article = new Readability(document).parse();
    const metadata = {
      Title: article.title,
      Author: article.author,
    };

    const ep = new exiftool.ExiftoolProcess(exiftoolBin);

    try {
      await ep.open();
      await ep.writeMetadata(file, metadata);
    } catch (error) {
      console.log(error);
    }
  }

  deleteFilesOlderThan(directory: string, time: number) {
    fs.readdir(directory, function(err, files) {
      files.forEach(function(file, index) {
        fs.stat(path.join(directory, file), function(err, stat) {
          if (err) {
            return console.error(err);
          }
          const now = new Date().getTime();
          const endTime = new Date(stat.ctime).getTime() + time;
          if (now > endTime) {
            return fs.unlinkSync(path.join(directory, file));
          }
        });
      });
    });
  }
  async cleanupOld() {
    this.deleteFilesOlderThan(basePath, 60 * 60 * 1000);
  }
}
