import { DiceRoll } from "#pages/dice";
import { Side } from "#enums/attack";

export class Roll {
    natural : number;
    modified : number;

    constructor(natural : number) {
        this.natural = natural;
        this.modified = natural;
    }

    addModifier(modifier : number) {
        this.modified = Math.max(0, modifier + this.modified);
    }
}


export class Damage {
  damageHP: number;
  damageST: number;

  constructor(damageHP: number, damageST: number) {
    this.damageHP = damageHP;
    this.damageST = damageST;
  }
}

export class CombatStepResult {
  diceAlly: DiceRoll | null;
  diceEnemy: DiceRoll | null;
  rollAlly: Roll;
  rollEnemy: Roll;
  winner: Side;
  damageHP: number;
  damageST: number;

  constructor(
    diceAlly: DiceRoll | null,
    diceEnemy: DiceRoll | null,
    rollAlly: Roll,
    rollEnemy: Roll,
    winner: Side,
    damage: Damage | null
  ) {
    this.diceAlly = diceAlly;
    this.diceEnemy = diceEnemy;
    this.rollAlly = rollAlly;
    this.rollEnemy = rollEnemy;
    this.winner = winner;
    if (damage == null) {
      this.damageHP = 0;
      this.damageST = 0;
    } else {
      this.damageHP = damage.damageHP;
      this.damageST = damage.damageST;
    }
  }

  static noCombatStep(): CombatStepResult {
    return new CombatStepResult(new DiceRoll(0, 0, 0, []), new DiceRoll(0, 0, 0, []), new Roll(0), new Roll(0), Side.NA, new Damage(0, 0));
  }
}

export class MassCombatStepResult {
  massDice: DiceRoll | null;
  massRoll: Roll;
  massSide: Side;
  foesDices: Map<number, DiceRoll | null>; // Map<foeIndex, DiceRoll>
  foesRolls: Map<number, Roll>; // Map<foeIndex, roll>
  foesDamage: Map<number, Damage>; // Map<foeIndex, Damage>

  constructor() {
    this.massDice = null;
    this.massRoll= new Roll(0);
    this.massSide = Side.NA;
    this.foesDices = new Map<number, DiceRoll | null>();
    this.foesRolls = new Map<number, Roll>();
    this.foesDamage = new Map<number, Damage>();
  }

  setMassRoll(dice: DiceRoll, massRoll: Roll) {
    this.massDice = dice;
    this.massRoll = massRoll;
  }

  addFoeResult(foeIndex: number, dice: DiceRoll | null, roll: Roll, damage: Damage | null) {
    this.foesDices.set(foeIndex, dice);
    this.foesRolls.set(foeIndex, roll);
    if (damage) this.foesDamage.set(foeIndex, damage);
    else this.foesDamage.set(foeIndex, new Damage(0, 0));
  }
}
