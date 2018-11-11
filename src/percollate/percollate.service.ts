import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as percollate from 'percollate';
import * as filenamify from 'filenamify';

const basePath = path.resolve(__dirname + '/../../cache');

@Injectable()
export class PercollateService {
  async pdf(urls: string[], options: any) {
    const file = path.resolve(basePath, filenamify(JSON.stringify(urls) + JSON.stringify(options)) + '.pdf');
    if (fs.existsSync(file)) {
      return file;
    }

    percollate.configure();

    await percollate.pdf(urls, {
      output: file,
      sandbox: false,
      ...options,
    });
    return file;
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
    this.deleteFilesOlderThan(basePath, 60 * 60 * 1000)
  }
}
