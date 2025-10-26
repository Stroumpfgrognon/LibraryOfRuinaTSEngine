import { StatusEffect } from "../@types/status";
import { AttackType, DMGType } from "../enums/attack";
import { Page } from "../pages/pages";
import { Deck } from "./deck";
import { EmotionEngine } from "./emotion";
import { Health } from "./health";

export class Character {
  name: string;
  health: Health;
  status: Array<StatusEffect>;
  deck : Deck;
  hand : Page[];
  emotion : EmotionEngine;

  constructor(
    name: string,
    health: Health,
    deck: Deck,
    emotion: EmotionEngine
  ) {
    this.name = name;
    this.health = health;
    this.status = [];
    this.deck = deck;
    this.hand = [];
    this.emotion = emotion;
  }

  doDamage(dmgtype: DMGType, atktype: AttackType, amount: number) {
    this.health.takeDamage(dmgtype, atktype, amount);
  }
}
