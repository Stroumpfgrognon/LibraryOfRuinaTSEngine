import { PageEffect } from "#pages/effects";
import { DiceRoll } from "#pages/roll";

export class Page {
  name: string;
  image: string;
  pageEffect: PageEffect.Effect;
  rolls: DiceRoll[];

  constructor(
    name: string,
    image: string,
    pageEffect: PageEffect.Effect,
    rolls: DiceRoll[]
  ) {
    this.name = name;
    this.image = image;
    this.pageEffect = pageEffect;
    this.rolls = rolls;
  }
}
