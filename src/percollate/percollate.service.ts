import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as exiftoolBin from 'dist-exiftool';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import * as exiftool from 'node-exiftool';
import * as path from 'path';
import * as percollate from 'percollate';
import * as Readability from 'readability';
import * as TurndownService from 'turndown';
import * as util from 'util';
import * as uuidv5 from 'uuid/v5';
import * as childProcess from 'child_process';

const exec = util.promisify(childProcess.exec);

const basePath = path.resolve(__dirname + '/../../cache');

@Injectable()
export class PercollateService {
  async run(urls: string[], method: string, pagesPerSide: number, options: any) {

    console.log(pagesPerSide);
    const filename = uuidv5(JSON.stringify(urls) + JSON.stringify(options) + pagesPerSide, uuidv5.URL) + '.' + method;
    const file = path.resolve(
      basePath,
      filename,
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
          template: path.join(__dirname, './default-template.html'),
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
          template: path.join(__dirname, './markdown-template.html'),
          ...options,
        });
        await this.htmlFileToMarkdownFile(file);
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

  async htmlFileToMarkdownFile(file: string) {
    await new Promise((resolve, reject) => {
      fs.readFile(file, (readFileError, buf) => {
        const html = buf.toString();
        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(html);

        fs.writeFile(file, markdown, writeFileError => {
          if (writeFileError) console.log(writeFileError);
          console.log('Successfully written markdown to file.');
          resolve(file);
        });
      });
    });
  }
}
