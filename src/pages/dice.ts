import { DiceEffect } from "#pages/effects";
import { DiceType } from "#enums/attack";

export class DiceRoll {
  rollMin: number;
  rollMax: number;
  type: DiceType;
  effects: DiceEffect.DiceEffect[];
  used : boolean = false;

  constructor(
    rollMin: number,
    rollMax: number,
    type: DiceType,
    effects: DiceEffect.DiceEffect[],
    used: boolean = false
  ) {
    this.rollMin = rollMin;
    this.rollMax = rollMax;
    this.type = type;
    this.effects = effects;
    this.used = used;
  }

  copy() : DiceRoll {
    return new DiceRoll(
      this.rollMin,
      this.rollMax,
      this.type,
      this.effects,
      this.used
    );
  }
}