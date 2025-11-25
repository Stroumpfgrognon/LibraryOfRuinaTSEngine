import { Page } from "#pages/pages";
import { DiceRoll } from "#pages/dice";
import { DiceType } from "#enums/attack";
import { PageEffect } from "#pages/effects";
import { DiceEffect } from "#pages/effects";
import { RollResultWithStatus } from "#results/results";
import { PageResultMessage } from "#results/resultlist";
import * as Statuses from "#status/regular-status";
import { Targetting } from "#results/targets";
import { PageType } from "#enums/attack";

export class LightAttack extends Page {
  constructor() {
    super(
      "Light Attack",
      PageType.Melee,
      1,
      "/img/degraded_shockwave_mini.png",
      "/img/degraded_shockwave.png",
      new PageEffect.NullEffect(),
      [
        new DiceRoll(2, 3, DiceType.Pierce, [new DiceEffect.NullEffect()]),
        new DiceRoll(1, 4, DiceType.Blunt, [new DiceEffect.NullEffect()]),
      ]
    );
  }
}

export class PreparedMind extends Page {
  constructor() {
    super(
      "Prepared Mind",
      PageType.Melee,
      1,
      "/img/prepared_mind_mini.png",
      "/img/prepared_mind.png",
      new PageEffect.NullEffect(),
      [
        new DiceRoll(2, 4, DiceType.Block, [
          new DiceEffect.OnClashWin(
            "Gain 1 Endurance next scene",
            new PageResultMessage([
              new RollResultWithStatus(new Statuses.Endurance(1, true), new Targetting.SelfTarget(), 1),
            ])
          ),
        ]),
        new DiceRoll(2, 6, DiceType.Slash, [new DiceEffect.NullEffect()]),
      ]
    );
  }
}

export class DegradedShockwave extends Page {
  constructor() {
    super(
      "Degraded Shockwave",
      PageType.Mass_Individual,
      5,
      "/img/degraded_shockwave_mini.png",
      "/img/degraded_shockwave.png",
      new PageEffect.OnUse(
        "Give 3 Protection to all allies this scene",
        new PageResultMessage([
          new RollResultWithStatus(new Statuses.Protection(3, false), new Targetting.AlliesTarget(), 1),
        ])
      ),
      [
        new DiceRoll(3, 8, DiceType.Blunt, [new DiceEffect.NullEffect()]),
        new DiceRoll(3, 8, DiceType.Blunt, [new DiceEffect.NullEffect()]),
        new DiceRoll(4, 8, DiceType.Blunt, [
          new DiceEffect.OnHit(
            "Inflict 1 Feeble next scene",
            new PageResultMessage([
              new RollResultWithStatus(new Statuses.Feeble(1, true), new Targetting.SingleTarget(), 1),
            ])
          ),
        ]),
      ]
    );
  }
}

export class GreatSplitHorizontal extends Page {
  constructor() {
    super(
      "Great Split Horizontal",
      PageType.Mass_Summation,
      5,
      "/img/great_split_horizontal_mini.png",
      "/img/great_split_horizontal.png",
      new PageEffect.NullEffect(),
      [
        new DiceRoll(28, 42, DiceType.Slash, [new DiceEffect.OnHit("Inflict 5 Bleed next scene", new PageResultMessage([new RollResultWithStatus(new Statuses.Bleed(5, true), new Targetting.AllTarget(), 1)]))]),
      ],
    );
  }
}
