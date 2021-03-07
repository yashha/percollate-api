import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';
import percollate from 'percollate';
import { Readability } from 'readability';
import util from 'util';
import { v5 as uuidv5 } from 'uuid';
import childProcess from 'child_process';

const exec = util.promisify(childProcess.exec);

const basePath = path.resolve(__dirname + '/../../cache');

@Injectable()
export class PercollateService {
  async run(urls: string[], method: string, pagesPerSide: number, options: any) {

    const filename = uuidv5(JSON.stringify(urls) + JSON.stringify(options) + pagesPerSide, uuidv5.URL) + '.' + method;
    const file = path.resolve(
      basePath,
      filename,
    );

    percollate.configure();

    console.log(options.author);
    options.author = '';

    switch (method) {
      case 'pdf':
        options.css += `
          div > figure {
            width: 30%;
            float: right;
            margin-left: 30px !important;
          }
        `;
        await percollate.pdf(urls, {
          output: file,
          sandbox: false,
          hyphenate: true,
          template: path.resolve(__dirname, '../../static/default-template.html'),
          ...options,
        });

        await this.convertPagesPerSide(file, pagesPerSide);

        break;
      case 'epub':
        await percollate.epub(urls, {
          output: file,
          sandbox: false,
          hyphenate: true,
          template: path.resolve(__dirname, '../../static/default-template.html'),
          ...options,
        });
        break;
      case 'html':
        options.css += `
          .article {
            max-width: 40rem;
            margin: 2rem auto;
          }
        `;
        await percollate.html(urls, {
          output: file,
          sandbox: false,
          hyphenate: true,
          template: path.resolve(__dirname, '../../static/default-template.html'),
          ...options,
        });
        break;
    }

    if (urls.length > 0) {
      const metadata = await this.getMetaData(urls[0], file);
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
      const noLandscape = orientation[pages] === 'portrait';
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

  async getMetaData(url: string, file: string) {
    const response = await fetch(url);
    const html = await response.text();
    const document = new JSDOM(html).window.document;
    const article = new Readability(document).parse();
    const metadata = {
      Title: article.title,
    };

    return metadata;
  }

  deleteFilesOlderThan(directory: string, time: number) {
    fs.readdir(directory, (readDirError, files) => {
      files.forEach((file, index) => {
        fs.stat(path.join(directory, file), (statError, stat) => {
          if (statError) {
            return console.error(statError);
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
