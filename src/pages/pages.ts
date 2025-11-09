import { PageEffect } from "#pages/effects";
import { DiceRoll } from "#pages/roll";

export enum PageType {
  Melee,
  Ranged,
  Mass_Individual,
  Mass_Summation
}

export class Page {
  name: string;
  type: PageType;
  image: string;
  imagebig: string;
  pageEffect: PageEffect.Effect;
  rolls: DiceRoll[];

  constructor(
    name: string,
    type: PageType,
    image: string,
    imagebig: string,
    pageEffect: PageEffect.Effect,
    rolls: DiceRoll[]
  ) {
    this.name = name;
    this.type = type;
    this.image = image;
    this.imagebig = imagebig;
    this.pageEffect = pageEffect;
    this.rolls = rolls;
  }
}

export class HandPage {
  page: Page;
  index: number;

  constructor(page: Page, index: number) {
    this.page = page;
    this.index = index;
  }
}
