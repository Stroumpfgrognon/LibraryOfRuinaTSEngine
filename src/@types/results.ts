import { EffectType } from "#enums/effect";
import { StatusEffect } from "#types/status";
export class Result {}

export class StatusResult extends Result {
  type: EffectType;
  value: number;

  constructor(type: EffectType, value: number) {
    super();
    this.type = type;
    this.value = value;
  }
}

export class RollResult extends Result {
  type: EffectType;
  value: number;

  constructor(type: EffectType, value: number) {
    super();
    this.type = type;
    this.value = value;
  }
}

export class RollResultWithStatus extends RollResult {
  statusType: StatusEffect;
  constructor(
    type: EffectType,
    value: number,
    statusType: StatusEffect
  ) {
    super(type, value);
    this.statusType = statusType;
  }
}
