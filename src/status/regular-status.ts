import { CombatTriggers } from "#triggers/triggers";
import { StatusEffect, ExpiringStatus } from "#status/status";
import { ExpungeStatusResult, StatusResult } from "#results/results";
import { ResultMessage, StatusResultMessage } from "#results/resultlist";
import { EffectType } from "#enums/effect";
import { Targetting } from "#results/targets";

export class Burn
  extends StatusEffect
  implements ExpiringStatus, CombatTriggers.endOfScene
{
  constructor(count: number, nextScene: boolean) {
    super(
      "Burn",
      "https://libraryofruina.wiki.gg/images/thumb/BurnIcon.png/26px-BurnIcon.png",
      "At the end of the Scene, take X damage and subtract 1/3rd of the Burn stack. (Rounds down).",
      true,
      count,
      false,
      nextScene
    );
  }

  expire() {
    this.count = Math.floor((this.count * 2) / 3);
    if (this.count <= 0) {
      return new ExpungeStatusResult();
    }
    return null;
  }

  endOfScene() {
    let result = StatusResultMessage.createMessage(
      new Targetting.SelfTarget(),
      EffectType.Damage,
      this.count
    );
    result.addResult(this.expire());
    return result;
  }
}

export class Feeble
  extends StatusEffect
  implements ExpiringStatus, CombatTriggers.DiceRoll
{
  constructor(count: number, nextScene: boolean) {
    super(
      "Feeble",
      "https://libraryofruina.wiki.gg/images/thumb/FragileIcon.png/26px-FragileIcon.png",
      "Offensive dice used by the character lose X power. Final result does not go below 1.",
      true,
      count,
      false,
      nextScene
    );
  }

  expire() {
    return new ExpungeStatusResult();
  }

  onDiceRoll(): ResultMessage {
    return StatusResultMessage.createMessage(
      new Targetting.SelfTarget(),
      EffectType.IncreaseRollOffensive,
      -this.count
    );
  }
}

export class Protection
  extends StatusEffect
  implements ExpiringStatus, CombatTriggers.OnHitReceived
{
  constructor(count: number, nextScene: boolean) {
    super(
      "Protection",
      "https://libraryofruina.wiki.gg/images/thumb/ProtectionIcon.png/26px-ProtectionIcon.png",
      "Take X less damage from attacks. The damage is substracted before resistance multipliers are applied.",
      true,
      count,
      false,
      nextScene
    );
  }

  expire() {
    return new ExpungeStatusResult();
  }

  onHitReceived(): ResultMessage {
    let result = StatusResultMessage.createMessage(
      new Targetting.SelfTarget(),
      EffectType.IncreaseDamage,
      -this.count
    );
    result.addResult(this.expire());
    return result;
  }
}
