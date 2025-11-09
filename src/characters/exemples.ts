import { characterSpriteSheet } from "#sprites/spritesheet";
import { Deck } from "#characters/deck";
import { HumanEmotionEngine } from "#characters/emotion";
import { Health, Resistance } from "#characters/health";
import { Character } from "#characters/characters";
import * as Pages from "#pages/exemples";

export class Finn extends Character {
  constructor() {
    let deck = new Deck();
    deck.addPage(new Pages.DegradedShockwave());
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
      3,
      1,
      10
    );
  }
}
