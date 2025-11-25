import { CombatTriggers } from "#triggers/triggers";
import { StatusEffect, ExpiringStatus } from "#status/status";
import { ExpungeStatusResult } from "#results/results";
import { ResultMessage, StatusResultMessage } from "#results/resultlist";
import { EffectType } from "#enums/effect";
import { Targetting } from "#results/targets";
import { DiceRoll } from "#pages/dice";
import { DiceType } from "#enums/attack";

export class Burn extends StatusEffect implements ExpiringStatus, CombatTriggers.endOfScene {
  constructor(count: number, nextScene: boolean) {
    super(
      "Burn",
      "https://libraryofruina.wiki.gg/images/thumb/BurnIcon.png/26px-BurnIcon.png",
      "At the end of the Scene, take X damage and subtract 1/3rd of the Burn stack. (Rounds down).",
      true,
      count,
      99,
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
    let result = StatusResultMessage.createMessage(new Targetting.SelfTarget(), EffectType.Damage, this.count);
    result.addResult(this.expire());
    return result;
  }

  override clone(): Burn {
    return new Burn(this.count, this.nextScene);
  }
}

export class Bleed extends StatusEffect implements ExpiringStatus, CombatTriggers.OnDiceRoll {
  constructor(count: number, nextScene: boolean) {
    super(
      "Bleed",
      "https://libraryofruina.wiki.gg/images/thumb/BleedIcon.png/26px-BleedIcon.png",
      "Each time the character uses an Offensive Die, they take X damage, then the number of stacks is reduced by 1/3 (rounded up).",
      true,
      count,
      99,
      false,
      nextScene
    );
  }

  expire(): ExpungeStatusResult | null {
    this.count = Math.floor((this.count * 2) / 3);
    if (this.count <= 0) {
      return new ExpungeStatusResult();
    }
    return null;
  }

  onDiceRoll(roll: DiceRoll | null): ResultMessage {
    if (roll === null || roll.type === DiceType.Block || roll.type === DiceType.Dodge)
      return new StatusResultMessage([]);
    let result = StatusResultMessage.createMessage(new Targetting.SelfTarget(), EffectType.Damage, this.count);
    let expiry = this.expire();
    if (expiry) {
      result.addResult(expiry);
    }
    return result;
  }
}

export class Feeble extends StatusEffect implements ExpiringStatus, CombatTriggers.OnDiceRoll {
  constructor(count: number, nextScene: boolean) {
    super(
      "Feeble",
      "https://libraryofruina.wiki.gg/images/thumb/FeebleIcon.png/26px-FeebleIcon.png",
      "Offensive dice used by the character lose X power. Final result does not go below 1.",
      true,
      count,
      99,
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

  override clone(): Feeble {
    return new Feeble(this.count, this.nextScene);
  }
}

export class Protection extends StatusEffect implements ExpiringStatus, CombatTriggers.OnDiceRoll {
  constructor(count: number, nextScene: boolean) {
    super(
      "Protection",
      "https://libraryofruina.wiki.gg/images/thumb/ProtectionIcon.png/26px-ProtectionIcon.png",
      "Take X less damage from attacks. The damage is substracted before resistance multipliers are applied.",
      true,
      count,
      99,
      false,
      nextScene
    );
  }

  expire() {
    return new ExpungeStatusResult();
  }

  onDiceRoll(): ResultMessage {
    let result = StatusResultMessage.createMessage(
      new Targetting.SelfTarget(),
      EffectType.IncreaseDamageReceived,
      -this.count
    );
    return result;
  }

  override clone(): Protection {
    return new Protection(this.count, this.nextScene);
  }
}

export class Endurance
  extends StatusEffect
  implements ExpiringStatus, CombatTriggers.OnDiceRoll, CombatTriggers.endOfScene
{
  constructor(count: number, nextScene: boolean) {
    super(
      "Endurance",
      "https://libraryofruina.wiki.gg/images/thumb/EnduranceIcon.png/26px-EnduranceIcon.png",
      "Defensive dice used by the character gain X power.",
      true,
      count,
      99,
      false,
      nextScene
    );
  }

  expire() {
    return new ExpungeStatusResult();
  }

  onDiceRoll(): ResultMessage {
    return StatusResultMessage.createMessage(new Targetting.SelfTarget(), EffectType.IncreaseRollDefensive, this.count);
  }

  endOfScene() {
    let result = new StatusResultMessage([]);
    let expiry = this.expire();
    if (expiry) {
      result.addResult(expiry);
    }
    return result;
  }

  override clone(): Endurance {
    return new Endurance(this.count, this.nextScene);
  }
}
