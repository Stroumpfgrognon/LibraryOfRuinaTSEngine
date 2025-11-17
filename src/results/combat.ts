import { Side } from "#enums/attack";
import { Page } from "#pages/pages";
import { DiceRoll } from "#pages/roll";
import { ResultMessage } from "./resultlist";

export class Diceclash {
  allyIndex: number;
  enemyIndex: number;
  pageAlly: Page | null;
  pageEnemy: Page | null;
  diceAlly: DiceRoll | null;
  diceEnemy: DiceRoll | null;
  mass: boolean = false;

  constructor(allyIndex: number, enemyIndex: number, pageAlly: Page | null, pageEnemy: Page | null, diceAlly: DiceRoll | null, diceEnemy: DiceRoll | null, mass: boolean = false) {
    this.allyIndex = allyIndex;
    this.enemyIndex = enemyIndex;
    this.pageAlly = pageAlly;
    this.pageEnemy = pageEnemy;
    this.diceAlly = diceAlly;
    this.diceEnemy = diceEnemy;
    this.mass = mass;
  }
}

export class CombatSecondaryEffect {
  originIndex: number;
  targetIndex: number;
  side: Side;
  effects: ResultMessage[];

  constructor(originIndex: number, targetIndex: number, side: Side, effects: ResultMessage[]) {
    this.originIndex = originIndex;
    this.targetIndex = targetIndex;
    this.side = side;
    this.effects = effects;
  }
}

export class EndOfDiceclash extends CombatSecondaryEffect {
  constructor() {
    super(-1, -1, Side.NA, []);
  }
}

export class EndOfClash extends CombatSecondaryEffect {
  constructor() {
    super(-2, -2, Side.NA, []);
  }
}


export class RollResult {
  
}