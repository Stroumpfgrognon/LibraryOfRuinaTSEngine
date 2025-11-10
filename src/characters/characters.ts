import { StatusEffect } from "#status/status";
import { AttackType, DMGType } from "#enums/attack";
import { Page, HandPage } from "#pages/pages";
import { characterSpriteSheet } from "#sprites/spritesheet";
import { Deck } from "#characters/deck";
import { Dice } from "#characters/dice";
import { EmotionEngine } from "#characters/emotion";
import { Health } from "#characters/health";
import { TurnStats } from "#characters/stats";
import { Attack } from "#characters/attacks";
import { LightEngine } from "#characters/light";

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
  lightengine: LightEngine;
  turnstat: TurnStats = new TurnStats();
  dices: Dice[];
  attacks: Attack[] = [];

  constructor(
    name: string,
    spritesheet: characterSpriteSheet,
    health: Health,
    deck: Deck,
    emotion: EmotionEngine,
    lightengine: LightEngine,
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
    this.lightengine = lightengine;
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
    enemyIndex: number,
    enemyDiceIndex: number
  ) {
    if (!this.lightengine.consumeLight(this.hand[pageIndex].cost)) return;
    this.attacks.push(
      new Attack(pageIndex, diceIndex, enemyIndex, enemyDiceIndex)
    );
    this.activeHand = this.getAvailablePages();
  }

  unplayPage(diceIndex: number) {
    let attack = this.attacks.find((attack) => attack.diceIndex === diceIndex);
    if (!attack) return;
    this.lightengine.addLight(this.hand[attack.pageIndex].cost);
    this.attacks = this.attacks.filter(
      (attack) => attack.diceIndex !== diceIndex
    );
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

  startOfScene() {
    this.turnstat.reset();
    this.deck.drawPage();
    this.activeHand = this.getAvailablePages();
    this.lightengine.addLight(1);
    for (let dice of this.dices) {
        dice.doRoll(this.turnstat.speedAdd);
      }
      this.dices.sort((dice1, dice2) => dice2.roll - dice1.roll);
  }
}
