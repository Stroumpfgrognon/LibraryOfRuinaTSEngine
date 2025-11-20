import { Attack } from "#characters/attacks";
import { Side } from "#enums/attack";
import { Page } from "#pages/pages";

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
  mass : boolean = false;
  extra_targets : Attack[] = [];

  constructor(attackA: ClashAttack, attackB: ClashAttack | null, mass: boolean = false, extra_targets : Attack[] = []) {
    this.attackA = attackA;
    this.attackB = attackB;
    this.mass = mass;
    this.extra_targets = extra_targets;
  }

  doClash(attackB: ClashAttack): boolean {
    if (this.attackB != null || this.mass) {
      return false;
    }
    this.attackB = attackB;
    return true;
  }
}

export class ClashFull {
  allyIndex : number;
  enemyIndex : number;
  allyPage : Page | null;
  enemyPage : Page | null;
  priority_level : 0 | 1 | 2 = 0; // 0 = melee, 1 = ranged, 2 = mass
  mass_side : Side = Side.NA;
  mass_speed : number = 0;
  extra_targets : Attack[] = [];

  constructor(allyIndex : number, enemyIndex : number, allyPage : Page | null, enemyPage : Page | null, priority_level : 0 | 1 | 2 = 0, mass_side : Side = Side.NA, mass_speed : number = 0, extra_targets : Attack[] = []) {
    this.allyIndex = allyIndex;
    this.enemyIndex = enemyIndex;
    this.allyPage = allyPage;
    this.enemyPage = enemyPage;
    this.priority_level = priority_level;
    this.mass_side = mass_side;
    this.mass_speed = mass_speed;
    this.extra_targets = extra_targets;
  }
}