import { Attack } from "#characters/attacks";
import { Side } from "#enums/attack";

export class ClashAttack {
  attack: Attack;
  characterIndex: number;
  side: Side
  speed: number;

  constructor(
    attack: Attack,
    characterIndex: number,
    side: Side,
    speed: number
  ) {
    this.attack = attack;
    this.characterIndex = characterIndex;
    this.side = side;
    this.speed = speed;
  }
}

export class Clash {
  attackA: ClashAttack;
  attackB: ClashAttack | null;

  constructor(attackA: ClashAttack, attackB: ClashAttack | null) {
    this.attackA = attackA;
    this.attackB = attackB;
  }

  doClash(attackB: ClashAttack): boolean {
    if (this.attackB != null) {
      return false;
    }
    this.attackB = attackB;
    return true;
  }
}
