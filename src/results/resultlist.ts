import { StatusResult, RollResult } from "#results/results";
import { EffectType } from "#enums/effect";
import { Targetting } from "#results/targets";

export class ResultMessage {}

export class StatusResultMessage extends ResultMessage {
  results: StatusResult[];

  constructor(results: StatusResult[]) {
    super();
    this.results = results;
  }

  static createMessage(
    target : Targetting.Target,
    type: EffectType,
    value: number
  ): StatusResultMessage {
    return new StatusResultMessage([new StatusResult(target, type, value)]);
  }

  addResult(result: StatusResult | null) {
    if (result) this.results.push(result);
  }
}

export class RollResultMessage extends ResultMessage {
  results: RollResult[];

  constructor(results: RollResult[]) {
    super();
    this.results = results;
  }
  static createMessage(
    target: Targetting.Target,
    type: EffectType,
    value: number
  ): RollResultMessage {
    return new RollResultMessage([new RollResult(target, type, value)]);
  }
  addResult(result: RollResult | null) {
    if (result) this.results.push(result);
  }
}
