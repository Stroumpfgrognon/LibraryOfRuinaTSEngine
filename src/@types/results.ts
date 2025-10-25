import { StatusEffectType } from "../enums/status";

export class StatusResult {
  type: StatusEffectType;
  value: number;

  constructor(type: StatusEffectType, value: number) {
    this.type = type;
    this.value = value;
  }
}

export class StatusResultMessage {
  results: StatusResult[];

  constructor(results: StatusResult[]) {
    this.results = results;
  }

  static createMessage(
    type: StatusEffectType,
    value: number
  ): StatusResultMessage {
    return new StatusResultMessage([new StatusResult(type, value)]);
  }

  addResult(result: StatusResult | null) {
    if (result) this.results.push(result);
  }
}
