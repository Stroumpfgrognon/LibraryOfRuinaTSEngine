import { StatusEffect } from "#status/status";
import { AttackType, DMGType } from "#enums/attack";
import { Page, HandPage } from "#pages/pages";
import { characterSpriteSheet } from "#sprites/spritesheet";
import { Deck } from "#characters/deck";
import { Dice } from "#characters/dice";
import { EmotionEngine } from "#characters/emotion";
import { Health } from "#characters/health";
import { TurnStats } from "#characters/stats";
import { Attack } from "./attacks";

let idCounter = 0;

export class Character {
  id: number;
  name: string;
  spritesheet: characterSpriteSheet;
  health: Health;
  status: Array<StatusEffect>;
  deck: Deck;
  hand: Page[];
  activeHand: HandPage[] | null = null;
  emotion: EmotionEngine;
  turnstat: TurnStats = new TurnStats();
  dices: Dice[];
  attacks: Attack[] = [];

  constructor(
    name: string,
    spritesheet: characterSpriteSheet,
    health: Health,
    deck: Deck,
    emotion: EmotionEngine,
    diceamount: number,
    mindice: number,
    maxdice: number
  ) {
    this.id = idCounter++;
    this.name = name;
    this.spritesheet = spritesheet;
    this.health = health;
    this.status = [];
    this.deck = deck;
    let handvar = [];
    for (let i = 0; i < 10; i++) {
      handvar.push(deck.drawPage());
    }
    this.hand = handvar;
    this.emotion = emotion;
    this.dices = [];
    for (let i = 0; i < diceamount; i++) {
      this.dices.push(new Dice(mindice, maxdice));
    }
    this.activeHand = this.getAvailablePages();
  }

  doDamage(dmgtype: DMGType, atktype: AttackType, amount: number) {
    this.health.takeDamage(dmgtype, atktype, amount);
  }

  playPage(
    pageIndex: number,
    diceIndex: number,
    ennemyIndex: number,
    ennemyDiceIndex: number
  ) {
    this.attacks.push(
      new Attack(pageIndex, diceIndex, ennemyIndex, ennemyDiceIndex)
    );
    this.activeHand = this.getAvailablePages();
  }

  unplayPage(diceIndex: number) {
    this.attacks = this.attacks.filter((attack) => attack.diceIndex !== diceIndex);
    this.activeHand = this.getAvailablePages();
  }

  getAvailablePages(): HandPage[] {
    let result = [];
    let used = [];
    for (const attack of this.attacks) {
      used.push(attack.pageIndex);
    }
    for (let i = 0; i < this.hand.length; i++) {
      if (!used.includes(i)) {
        result.push(new HandPage(this.hand[i], i));
      }
    }
    return result;
  }
}
