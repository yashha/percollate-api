import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  root(): string {
    return `
      <h1>Read the web API</h1>
      <p>Examples pdf: </p>
      <ul>
        <li><a href="/load.pdf?url=https://de.wikipedia.org/wiki/JavaScript">Wiki JavaScript</a></li>
        <li><a href="/load.pdf?url=https://de.wikipedia.org/wiki/JavaScript&css=html,body{width:100%;overflow:hidden;}">Wiki JavaScript better fontsize</a></li>
        <li><a href="/load.pdf?url=https://de.wikipedia.org/wiki/JavaScript&url=https://de.wikipedia.org/wiki/Hypertext_Markup_Language&css=html{font-size:26px}&toc=true">Multiple Wiki pages with Table of contents</a></li>
      </ul>
      <p>Examples: epub </p>
      <ul>
        <li><a href="/load.epub?url=https://de.wikipedia.org/wiki/JavaScript">Wiki JavaScript</a></li>
      </ul>
      <p>Examples: html </p>
      <ul>
        <li><a href="/load.html?url=https://de.wikipedia.org/wiki/JavaScript">Wiki JavaScript</a></li>
      </ul>
      <p>Examples: markdown </p>
      <ul>
        <li><a href="/load.md?url=https://de.wikipedia.org/wiki/JavaScript">Wiki JavaScript</a></li>
      </ul>
    `;
  }
}
