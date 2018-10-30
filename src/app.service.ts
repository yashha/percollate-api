import { Injectable } from '@nestjs/common';
import * as data from '../package.json';

@Injectable()
export class AppService {
  root(): string {
    return `
      Percollate Version: ${data.dependencies.percollate}
    `;
  }
}
