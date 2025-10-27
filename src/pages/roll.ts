import { DiceEffect } from "./effects";
import { DMGType } from "../enums/attack";

export class DiceRoll {
  rollMin: number;
  rollMax: number;
  type: DMGType;
  effects: DiceEffect.Effect[];

  constructor(
    rollMin: number,
    rollMax: number,
    type: DMGType,
    effects: DiceEffect.Effect[]
  ) {
    this.rollMin = rollMin;
    this.rollMax = rollMax;
    this.type = type;
    this.effects = effects;
  }
}
