import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as percollate from 'percollate';
import * as filenamify from 'filenamify';
import * as Readability from 'readability';
import * as exiftool from 'node-exiftool';
import * as exiftoolBin from 'dist-exiftool';
import * as TurndownService from 'turndown';
import axios from 'axios';
import { JSDOM } from 'jsdom';

const basePath = path.resolve(__dirname + '/../../cache');

@Injectable()
export class PercollateService {
  async run(urls: string[], method: string, options: any) {
    const file = path.resolve(
      basePath,
      filenamify(JSON.stringify(urls) + JSON.stringify(options), { replacement: "" }) + "." + method
    );
    if (fs.existsSync(file)) {
      const metadata = await this.addExif(urls[0], file);
      return { file: file, title: metadata.Title };
    }

    percollate.configure();

    switch (method) {
      case 'pdf':
        await percollate.pdf(urls, {
          output: file,
          sandbox: false,
          ...options,
        });
        break;
      case 'epub':
        await percollate.epub(urls, {
          output: file,
          sandbox: false,
          ...options,
        });
        break;
      case 'html':
        await percollate.html(urls, {
          output: file,
          sandbox: false,
          ...options,
        });
        break;
      case 'md':
        await percollate.html(urls, {
          output: file,
          sandbox: false,
          ...options,
        });
        await new Promise((resolve, reject) => {
          fs.readFile(file, (err, buf) => {
            let html = buf.toString();
            const turndownService = new TurndownService();
            const markdown = turndownService.turndown(html);

            fs.writeFile(file, markdown, err => {
              if (err) console.log(err);
              console.log('Successfully Written to File.');
              resolve(file);
            });
          });
        });
        break;
    }

    if (urls.length > 0) {
      const metadata = await this.addExif(urls[0], file);
      return { file: file, title: metadata.Title };
    }

    return { file: file };
  }

  async addExif(url: string, file: string) {
    const { data } = await axios.get<string>(url);
    const document = new JSDOM(data).window.document;
    const article = new Readability(document).parse();
    const metadata = {
      Title: article.title,
    };

    const ep = new exiftool.ExiftoolProcess(exiftoolBin);

    try {
      await ep.open();
      await ep.writeMetadata(file, metadata);
    } catch (error) {
      console.log(error);
    }
    return metadata;
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
