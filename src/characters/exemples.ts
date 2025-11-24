import { characterSpriteSheet } from "#sprites/spritesheet";
import { Deck } from "#characters/deck";
import { HumanEmotionEngine } from "#characters/emotion";
import { Health, Resistance } from "#characters/health";
import { Character } from "#characters/characters";
import * as Pages from "#pages/exemples";
import { LightEngine } from "./light";

export class Finn extends Character {
  constructor() {
    let deck = new Deck();
    deck.addPage(new Pages.LightAttack());
    deck.addPage(new Pages.PreparedMind());
    super(
      "Finn",
      new characterSpriteSheet(
        "https://libraryofruina.wiki.gg/images/Finn-combat-sprite-idle.png",
        "https://libraryofruina.wiki.gg/images/Finn-combat-sprite-move.png",
        "https://libraryofruina.wiki.gg/images/Finn-combat-sprite-slash.png",
        "https://libraryofruina.wiki.gg/images/Finn-combat-sprite-pierce.png",
        "https://libraryofruina.wiki.gg/images/Finn-combat-sprite-blunt.png",
        "https://libraryofruina.wiki.gg/images/Finn-combat-sprite-block.png",
        "https://libraryofruina.wiki.gg/images/Finn-combat-sprite-evade.png",
        "https://libraryofruina.wiki.gg/images/Finn-combat-sprite-damaged.png",
        "",
        1
      ),
      new Health(100, 100, 100, 100, new Resistance(1, 1, 1, 1, 1, 1)),
      deck,
      new HumanEmotionEngine(),
      new LightEngine(5),
      3,
      1,
      6
    );
  }
}

export class Binah extends Character {
  constructor() {
    let deck = new Deck();
    deck.addPage(new Pages.DegradedShockwave());
    deck.addPage(new Pages.PreparedMind());
    super(
      "Binah",
      new characterSpriteSheet(
        "https://libraryofruina.wiki.gg/images/BinahCombatIdle.png",
        "https://libraryofruina.wiki.gg/images/BinahCombatMove.png",
        "https://libraryofruina.wiki.gg/images/BinahCombatSlash.png",
        "https://libraryofruina.wiki.gg/images/BinahCombatPierce.png",
        "https://libraryofruina.wiki.gg/images/BinahCombatBlunt.png",
        "https://libraryofruina.wiki.gg/images/BinahCombatBlock.png",
        "https://libraryofruina.wiki.gg/images/BinahCombatEvade.png",
        "https://libraryofruina.wiki.gg/images/BinahCombatDamaged.png",
        "",
        1
      ),
      new Health(200, 200, 200, 200, new Resistance(0.5, 1, 2, 2, 1, 0.5)),
      deck,
      new HumanEmotionEngine(),
      new LightEngine(10),
      4,
      8,
      8,
    );
  }
}
