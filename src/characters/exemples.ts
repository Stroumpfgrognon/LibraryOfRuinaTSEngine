import { characterSpriteSheet } from "#sprites/spritesheet";
import { Deck } from "#characters/deck";
import { Page } from "#pages/pages";
import { HumanEmotionEngine } from "#characters/emotion";
import { Health, Resistance } from "#characters/health";
import { Character } from "#characters/characters";
import { DiceRoll } from "#pages/roll";
import { DMGType } from "#enums/attack";
import { DiceEffect, PageEffect } from "#pages/effects";

export class Finn extends Character {
  finndeck = new Deck();
  constructor() {
    super(
      "Finn",
      new characterSpriteSheet("", "", "", "", "", "", "", "", "", 1),
      new Health(100, 100, 100, 100, new Resistance(1, 1, 1, 1, 1, 1)),
      new Deck(),
      new HumanEmotionEngine(),
      3,
      1,
      10
    );
    this.deck.addPage(new Page("Killer wave","",new PageEffect.NullEffect(),[new DiceRoll(1,10,DMGType.Slash,[new DiceEffect.NullEffect()])]));
  }
}