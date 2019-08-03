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
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const basePath = path.resolve(__dirname + '/../../cache');

@Injectable()
export class PercollateService {
  async run(urls: string[], method: string, pagesPerSide: number, options: any) {
    const file = path.resolve(
      basePath,
      filenamify(JSON.stringify(urls) + JSON.stringify(options), { replacement: '' }) + pagesPerSide + '.' + method,
    );
    if (fs.existsSync(file)) {
      const metadata = await this.addExif(urls[0], file);
      return { file, title: metadata.Title };
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
            const html = buf.toString();
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

    await this.convertPagesPerSide(file, pagesPerSide);
    if (urls.length > 0) {
      const metadata = await this.addExif(urls[0], file);
      return { file, title: metadata.Title };
    }

    return { file };
  }

  async convertPagesPerSide(file, pages) {
    const orientation = {
      2: 'landscape',
      4: 'portrait',
      // 6: "landscape",
      // 9: "portrait",
      // 16: "portrait",
    };

    const mode = {
      2: '2x1',
      4: '2x2',
      // 6: "3x2",
      // 9: "3x3",
      // 16: "4x4",
    };

    console.log(orientation[pages]);
    console.log(mode[pages]);
    if (orientation[pages] && mode[pages]) {
      const noLandscape = orientation[pages] == 'portrait';
      const nup = mode[pages];
      await this.convertNup(file, nup, noLandscape);
    }
  }
  async convertNup(file, nup= '2x1', noLandscape= false) {
    const noLandscapeAttribute = noLandscape ? '--no-landscape' : '';
    const { stdout, stderr } = await exec(`pdfnup --nup ${nup} ${file} ${noLandscapeAttribute} --outfile ${file}`);
    console.log(stdout);
    console.log(stderr);
    return file;
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
