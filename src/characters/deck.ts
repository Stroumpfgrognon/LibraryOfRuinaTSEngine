import {Page} from "#pages/pages";

function getRandomInt(max : number) : number {
  return Math.floor(Math.random() * max);
}

export class Deck {
  pages: Page[];

  private seenPages: number[] = []; 

  constructor() {
    this.pages = [];
  }

  addPage(page: Page) {
    this.pages.push(page);
  }

  removePage(page: Page) {
    this.pages = this.pages.filter(p => p !== page);
  }

  drawPage(): Page {
    if(this.seenPages.length >= this.pages.length) {
      this.seenPages = [];
    }
    let roll = getRandomInt(this.pages.length);
    while (this.seenPages.includes(roll)) {
      roll = getRandomInt(this.pages.length);
    }
    this.seenPages.push(roll);
    return this.pages[roll].copy();
  }
}