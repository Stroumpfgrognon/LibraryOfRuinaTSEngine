import { EffectType } from "#enums/effect";
import { StatusEffect } from "#status/status";
import { Targetting } from "#results/targets";

export class Result {
  target: Targetting.Target;
  type: EffectType;
  value: number;

  constructor(target: Targetting.Target, type: EffectType, value: number) {
    this.target = target;
    this.type = type;
    this.value = value;
  }
}

export class StatusResult extends Result {

  constructor(target: Targetting.Target, type: EffectType, value: number) {
    super(target, type, value);
  }
}

export class ExpungeStatusResult extends StatusResult {
  constructor() {
    super(new Targetting.SelfTarget(), EffectType.ExpungeStatus, 1);
  }
}

export class RollResult extends Result {

  constructor(target: Targetting.Target, type: EffectType, value: number) {
    super(target, type, value);
  }
}

export class RollResultWithStatus extends RollResult {
  statusType: StatusEffect;
  constructor(
    statusType: StatusEffect,
    target: Targetting.Target,
    value: number
  ) {
    super(target, EffectType.InflictStatus, value);
    this.statusType = statusType;
  }
}
