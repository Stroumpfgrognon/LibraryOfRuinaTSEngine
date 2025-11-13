import {
  StatusResult,
  RollResult as PageResult,
  Result,
} from "#results/results";
import { EffectType } from "#enums/effect";
import { Targetting } from "#results/targets";

export class ResultMessage {
  results: Result[];
  constructor(results: Result[]) {
    this.results = results;
  }
}

export class StatusResultMessage extends ResultMessage {
  constructor(results: StatusResult[]) {
    super(results);
    this.results = results;
  }

  static createMessage(
    target: Targetting.Target,
    type: EffectType,
    value: number
  ): StatusResultMessage {
    return new StatusResultMessage([new StatusResult(target, type, value)]);
  }

  static emptyMessage(): StatusResultMessage {
    return new StatusResultMessage([]);
  }

  addResult(result: StatusResult | null) {
    if (result) this.results.push(result);
  }
}

export class PageResultMessage extends ResultMessage {

  constructor(results: PageResult[]) {
    super(results);
  }
  static createMessage(
    target: Targetting.Target,
    type: EffectType,
    value: number
  ): PageResultMessage {
    return new PageResultMessage([new PageResult(target, type, value)]);
  }

  static emptyMessage(): PageResultMessage {
    return new PageResultMessage([]);
  }

  addResult(result: PageResult | null) {
    if (result) this.results.push(result);
  }
}
