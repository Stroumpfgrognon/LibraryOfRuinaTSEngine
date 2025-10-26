import {Page} from "../pages/pages";

export class Deck {
  pages: Page[];

  constructor() {
    this.pages = [];
  }

  addPage(page: Page) {
    this.pages.push(page);
  }

  removePage(page: Page) {
    this.pages = this.pages.filter(p => p !== page);
  }
}