import { PageEffect } from "./effects";
import { DiceRoll } from "./roll";

export class Page {
    image : string;
    pageEffect : PageEffect;
    rolls: DiceRoll[];

    constructor(image: string, pageEffect: PageEffect, rolls: DiceRoll[]){
        this.image = image;
        this.pageEffect = pageEffect;
        this.rolls = rolls;
    }

}


