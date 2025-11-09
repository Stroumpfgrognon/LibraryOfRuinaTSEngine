import { Page, PageType } from "#pages/pages";
import { DiceRoll } from "#pages/roll";
import { DMGType } from "#enums/attack";
import { PageEffect } from "#pages/effects";
import { DiceEffect } from "#pages/effects";
import { RollResult, RollResultWithStatus } from "#results/results";
import { RollResultMessage } from "#results/resultlist";
import * as Statuses from "#status/regular-status";
import { Targetting } from "#results/targets";

export class DegradedShockwave extends Page {
  constructor() {
    super(
      "Degraded Shockwave",
      PageType.Mass_Individual,
      "/img/degraded_shockwave_mini.png",
      "/img/degraded_shockwave.png",
      new PageEffect.OnUse(
        "Give 3 Protection to all allies this scene",
        new RollResultMessage([
          new RollResultWithStatus(
            new Statuses.Protection(3, false),
            new Targetting.AlliesTarget(),
            1
          ),
        ])
      ),
      [
        new DiceRoll(3, 8, DMGType.Blunt, [new DiceEffect.NullEffect()]),
        new DiceRoll(3, 8, DMGType.Blunt, [new DiceEffect.NullEffect()]),
        new DiceRoll(4, 8, DMGType.Blunt, [
          new DiceEffect.OnHit(
            "Inflict 1 Feeble next scene",
            new RollResultMessage([
              new RollResultWithStatus(
                new Statuses.Feeble(1, true),
                new Targetting.SingleTarget(),
                1
              ),
            ])
          ),
        ]),
      ]
    );
  }
}
