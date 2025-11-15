import { TurnStats } from "#characters/stats";
import { AttackType } from "#enums/attack";
import { Page } from "#pages/pages";
import { DiceRoll } from "#pages/roll";

export class CombatResult {
  allyIndex: number;
  enemyIndex: number;
  allyStat: TurnStats;
  enemyStat: TurnStats;
  pageAlly: Page | null;
  pageEnemy: Page | null;
  diceAlly: DiceRoll | null;
  diceEnemy: DiceRoll | null;
  rollAlly: number;
  rollEnemy: number;
  damageAlly: number;
  damageEnemy: number;
  type : AttackType;
  mass: boolean = false;

  constructor(
    allyIndex: number,
    enemyIndex: number,
    allyStat: TurnStats,
    enemyStat: TurnStats,
    pageAlly: Page | null,
    pageEnemy: Page | null,
    diceAlly: DiceRoll | null,
    diceEnemy: DiceRoll | null,
    rollAlly: number,
    rollEnemy: number,
    damageAlly: number,
    damageEnemy: number,
    type : AttackType,
    mass: boolean = false
  ) {
    this.allyIndex = allyIndex;
    this.enemyIndex = enemyIndex;
    this.pageAlly = pageAlly;
    this.pageEnemy = pageEnemy;
    this.diceAlly = diceAlly;
    this.diceEnemy = diceEnemy;
    this.rollAlly = rollAlly;
    this.rollEnemy = rollEnemy;
    this.damageAlly = damageAlly;
    this.damageEnemy = damageEnemy;
    this.type = type;
    this.allyStat = allyStat;
    this.enemyStat = enemyStat;
    this.mass = mass;
  }

  static directDamage(
    allyIndex: number,
    enemyIndex: number,
    damageAlly: number,
    damageEnemy: number,
    type : AttackType
  ) : CombatResult {
    return new CombatResult(
      allyIndex,
      enemyIndex,
        new TurnStats(),
        new TurnStats(),
        null,
        null,
        null,
        null,
        -1,
        -1,
        damageAlly,
        damageEnemy,
        type,
        false
    );
}
}
