import { CombatTriggers } from "../@types/triggers";
import { StatusEffect, ExpiringStatus } from "../@types/status";
import { StatusResult } from "../@types/results.js";
import { StatusResultMessage } from "../@types/resultlist";
import { EffectType } from "../enums/effect";

export class Burn
  extends StatusEffect
  implements ExpiringStatus, CombatTriggers.endOfSceneTrigger
{
  constructor(count: number) {
    super(
      "Burn",
      "At the end of the Scene, take X damage and subtract 1/3rd of the Burn stack. (Rounds down).",
      true,
      count,
      false
    );
  }

  expire() {
    this.count = Math.floor((this.count * 2) / 3);
    if (this.count <= 0) {
      return new StatusResult(EffectType.ExpungeStatus, 1);
    }
    return null;
  }

  endOfScene() {
    let result = StatusResultMessage.createMessage(
      EffectType.Damage,
      this.count
    );
    result.addResult(this.expire());
    return result;
  }

  override getDescription(): string {
    return this.description.replace(" X ", ` ${this.count} `);
  }
}
