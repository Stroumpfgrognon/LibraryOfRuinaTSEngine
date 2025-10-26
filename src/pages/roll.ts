import { DiceRollEffect } from "./effects";
import { DMGType } from "../enums/attack";

export class DiceRoll {
  rollMin: number;
  rollMax: number;
  type: DMGType;
  effects: DiceRollEffect[];

  constructor(
    rollMin: number,
    rollMax: number,
    type: DMGType,
    effects: DiceRollEffect[]
  ) {
    this.rollMin = rollMin;
    this.rollMax = rollMax;
    this.type = type;
    this.effects = effects;
  }
}
