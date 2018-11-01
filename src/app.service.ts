import { Injectable } from '@nestjs/common';
import * as data from '../package-lock.json';

@Injectable()
export class AppService {
  root(): string {
    return `
      <h1><a href="https://github.com/yashha/percollate-api">Percollate API</a></h1>
      <div>
        <p><a href="https://github.com/danburzo/percollate">Percollate</a> Version: ${
          data.dependencies.percollate.version
        }</p>
        <p>Examples: </p>
      </div>
      <ul>
        <li><a href="/pdf?url=https://de.wikipedia.org/wiki/JavaScript">Wiki JavaScript</a></li>
        <li><a href="/pdf?url=https://de.wikipedia.org/wiki/JavaScript&css=html,body{width:100%;overflow:hidden;}">Wiki JavaScript better fontsize</a></li>
        <li><a href="/pdf?url=https://de.wikipedia.org/wiki/JavaScript&url=https://de.wikipedia.org/wiki/Hypertext_Markup_Language&css=html{font-size:26px}&toc=true">Multiple Wiki pages with Table of contents
      </ul>
    `;
  }
}
