import { StatusEffect } from "#status/status";
import { AttackType, DMGType } from "#enums/attack";
import { Page } from "#pages/pages";
import { characterSpriteSheet } from "#sprites/spritesheet";
import { Deck } from "#characters/deck";
import { Dice } from "#characters/dice";
import { EmotionEngine } from "#characters/emotion";
import { Health } from "#characters/health";
import { TurnStats } from "#characters/stats";

export class Character {
  name: string;
  spritesheet: characterSpriteSheet;
  health: Health;
  status: Array<StatusEffect>;
  deck : Deck;
  hand : Page[];
  emotion : EmotionEngine;
  turnstat : TurnStats = new TurnStats();
  dices : Dice[];

  constructor(
    name: string,
    spritesheet: characterSpriteSheet,
    health: Health,
    deck: Deck,
    emotion: EmotionEngine,
    diceamount: number,
    mindice: number,
    maxdice: number,
  ) {
    this.name = name;
    this.spritesheet = spritesheet;
    this.health = health;
    this.status = [];
    this.deck = deck;
    this.hand = [];
    this.emotion = emotion;
    this.dices = [];
    for (let i = 0; i < diceamount; i++) {
      this.dices.push(new Dice(mindice, maxdice));
    }
  }

  doDamage(dmgtype: DMGType, atktype: AttackType, amount: number) {
    this.health.takeDamage(dmgtype, atktype, amount);
  }
}
