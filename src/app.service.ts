import { Injectable } from '@nestjs/common';
import * as data from '../package.json';

@Injectable()
export class AppService {
  root(): string {
    return `
      <div>
        <p>Percollate Version: ${data.dependencies.percollate}</p>
        <p>Examples: </p>
      </div>
      <ul>
        <li><a href="/pdf?url=https://de.wikipedia.org/wiki/JavaScript">Wiki JavaScript</a></li>
        <li><a href="/pdf?url=https://de.wikipedia.org/wiki/JavaScript&css=html,body{width:100%;overflow:hidden;}">Wiki JavaScript better fontsize</a></li>
      </ul>
    `;
  }
}
