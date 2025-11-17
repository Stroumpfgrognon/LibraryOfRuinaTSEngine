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
  pageEffect: PageEffect.PageEffect;
  rolls: DiceRoll[];
  cost: number;
  broken: boolean = false;

  constructor(
    name: string,
    type: PageType,
    cost: number,
    image: string,
    imagebig: string,
    pageEffect: PageEffect.PageEffect,
    rolls: DiceRoll[],
    broken: boolean = false
  ) {
    this.name = name;
    this.type = type;
    this.cost = cost;
    this.image = image;
    this.imagebig = imagebig;
    this.pageEffect = pageEffect;
    this.rolls = rolls;
    this.broken = broken;
  }

  copy() : Page {
    let copyRolls : DiceRoll[] = [];
    for (let roll of this.rolls) {
      copyRolls.push(roll.copy());
    }
    return new Page(
      this.name,
      this.type,
      this.cost,
      this.image,
      this.imagebig,
      this.pageEffect,
      copyRolls,
      this.broken
    );
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
