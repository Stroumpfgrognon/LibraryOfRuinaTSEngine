import { DiceType, AttackType } from "#enums/attack";
import { TurnStats } from "#characters/stats";
import { Damage } from "#results/combat";
export class Resistance {
  SlashHP: number;
  PierceHP: number;
  BluntHP: number;
  SlashStagger: number;
  PierceStagger: number;
  BluntStagger: number;

  constructor(
    slashHP: number,
    pierceHP: number,
    bluntHP: number,
    slashStagger: number,
    pierceStagger: number,
    bluntStagger: number
  ) {
    this.SlashHP = slashHP;
    this.PierceHP = pierceHP;
    this.BluntHP = bluntHP;
    this.SlashStagger = slashStagger;
    this.PierceStagger = pierceStagger;
    this.BluntStagger = bluntStagger;
  }

  calculateDamage(type: DiceType, amount: number, isStagger: boolean, staggered: boolean): number {
    if (staggered) {
      if (type != DiceType.Pure) return 2 * amount;
      return amount;
    }
    switch (type) {
      case DiceType.Slash:
        return isStagger ? amount * (1 - this.SlashStagger / 100) : amount * (1 - this.SlashHP / 100);
      case DiceType.Pierce:
        return isStagger ? amount * (1 - this.PierceStagger / 100) : amount * (1 - this.PierceHP / 100);
      case DiceType.Blunt:
        return isStagger ? amount * (1 - this.BluntStagger / 100) : amount * (1 - this.BluntHP / 100);
      default:
        return amount;
    }
  }
}

export class Health {
  maxHP: number;
  currentHP: number;
  maxStagger: number;
  currentStagger: number;
  resistance: Resistance;
  staggered: boolean = false;

  constructor(
    maxHealth: number,
    currentHealth: number,
    maxStagger: number,
    currentStagger: number,
    resistance: Resistance
  ) {
    this.maxHP = maxHealth;
    this.currentHP = currentHealth;
    this.maxStagger = maxStagger;
    this.currentStagger = currentStagger;
    this.resistance = resistance;
  }

  takeDamage(
    dmgtype: DiceType,
    type: AttackType,
    amount: number,
    turnstat: TurnStats = new TurnStats(),
    opposingTurnstat: TurnStats = new TurnStats()
  ): Damage {
    // console.log(turnstat, opposingTurnstat);
    let damageToHealth = 0;
    let damageToStagger = 0;
    if (type === AttackType.HP || type === AttackType.Mixed) {
      damageToHealth = this.resistance.calculateDamage(dmgtype, amount, false, this.staggered);
      if (dmgtype != DiceType.Pure && amount >= 0)
        damageToHealth =
          damageToHealth * turnstat.damageReceivedMult * opposingTurnstat.damageDealtMult +
          turnstat.damageReceivedAdd +
          opposingTurnstat.damageDealtAdd;
      if (amount >= 0) damageToHealth = Math.max(0, Math.ceil(damageToHealth));
      else damageToHealth = Math.min(0, Math.floor(damageToHealth));
      this.currentHP = Math.min(this.maxHP, this.currentHP - damageToHealth);
      if (this.currentHP < 0) this.currentHP = 0;
    }
    if (type === AttackType.Stagger || type === AttackType.Mixed) {
      damageToStagger = this.resistance.calculateDamage(dmgtype, amount, true, this.staggered);
      if (dmgtype != DiceType.Pure && amount >= 0)
        damageToStagger =
          damageToStagger * turnstat.STdamageReceivedMult * opposingTurnstat.STdamageDealtMult +
          turnstat.STdamageReceivedAdd +
          opposingTurnstat.STdamageDealtAdd;
      if (amount >= 0) damageToStagger = Math.max(0, Math.ceil(damageToStagger));
      else damageToStagger = Math.min(0, Math.floor(damageToStagger));
      this.currentStagger = Math.min(this.maxStagger, this.currentStagger - damageToStagger);
      if (this.currentStagger <= 0) {
        this.currentStagger = 0;
        this.stagger();
      }
    }
    return new Damage(damageToHealth, damageToStagger);
  }

  stagger(): void {
    this.staggered = true;
  }

  staggerHeal(): void {
    if (this.staggered) {
      this.currentStagger = this.maxStagger;
      this.staggered = false;
    }
  }
}
