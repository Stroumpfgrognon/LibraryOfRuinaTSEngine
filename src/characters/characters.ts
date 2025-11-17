import { StatusEffect } from "#status/status";
import { AttackType, DiceType } from "#enums/attack";
import { Page, HandPage } from "#pages/pages";
import { characterSpriteSheet } from "#sprites/spritesheet";
import { Deck } from "#characters/deck";
import { SpeedDice } from "#characters/dice";
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
  dices: SpeedDice[];
  attacks: Attack[] = [];
  dead: boolean = false;
  immobilized: boolean = false;

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
      this.dices.push(new SpeedDice(mindice, maxdice));
    }
    this.activeHand = this.getAvailablePages();
  }

  doDamage(
    dmgtype: DiceType,
    atktype: AttackType,
    amount: number,
    opposingTurnstat: TurnStats = new TurnStats()
  ): boolean {
    if (this.dead) return false;
    if (dmgtype == DiceType.Pure) {
      this.health.takeDamage(dmgtype, atktype, amount, this.turnstat);
    } else {
      this.health.takeDamage(dmgtype, atktype, amount, this.turnstat, opposingTurnstat);
    }
    if (this.health.currentHP <= 0) {
      this.health.currentHP = 0;
      this.dead = true;
    }
    return true;
  }

  playPage(pageIndex: number, diceIndex: number, enemyIndex: number, enemyDiceIndex: number) {
    if (this.dead) return;
    if (!this.lightengine.consumeLight(this.hand[pageIndex].cost)) return;
    this.attacks.push(new Attack(pageIndex, diceIndex, enemyIndex, enemyDiceIndex));
    this.activeHand = this.getAvailablePages();
  }

  unplayPage(diceIndex: number) {
    if (this.dead || this.immobilized) return;
    let attack = this.attacks.find((attack) => attack.diceIndex === diceIndex);
    if (!attack) return;
    this.lightengine.addLight(this.hand[attack.pageIndex].cost);
    this.attacks = this.attacks.filter((attack) => attack.diceIndex !== diceIndex);
    this.activeHand = this.getAvailablePages();
  }

  getAvailablePages(): HandPage[] {
    if (this.dead || this.immobilized) return [];
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

  inflictStatus(status: StatusEffect): boolean {
    if (this.dead || this.immobilized) return false;
    let ref = -1;
    for (let i = 0; i < this.status.length; i++) {
      if (this.status[i].name === status.name) {
        ref = i;
        break;
      }
    }
    if (ref === -1) {
      this.status.push(status.clone());
    } else {
      this.status[ref].addCount(status.count);
    }
    return true;
  }

  immobilize(): boolean {
    if (this.dead || this.immobilized) return false;
    this.immobilized = true;
    this.attacks = [];
    for (let dice of this.dices) {
      dice.locked = true;
    }
    return true;
  }

  startOfScene() {
    if (this.dead) return;
    if (this.immobilized) {
      this.immobilized = false;
      for (let dice of this.dices) {
        dice.locked = false;
      }
    }
    this.deck.drawPage();
    this.activeHand = this.getAvailablePages();
    this.lightengine.addLight(1);
    for (let dice of this.dices) {
      dice.doRoll(this.turnstat.speedAdd);
    }
    this.turnstat.reset();
    this.dices.sort((dice1, dice2) => dice2.roll - dice1.roll);
  }

  // onDiceRoll(dice, handler)
}
