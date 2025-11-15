import { DiceEffect } from "#pages/effects";
import { DiceType } from "#enums/attack";

export class DiceRoll {
  rollMin: number;
  rollMax: number;
  type: DiceType;
  effects: DiceEffect.Effect[];

  constructor(
    rollMin: number,
    rollMax: number,
    type: DiceType,
    effects: DiceEffect.Effect[]
  ) {
    this.rollMin = rollMin;
    this.rollMax = rollMax;
    this.type = type;
    this.effects = effects;
  }
}
