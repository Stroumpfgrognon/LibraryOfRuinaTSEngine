import { DiceType, AttackType } from "#enums/attack";
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

  calculateDamage(
    type: DiceType,
    amount: number,
    isStagger: boolean,
    staggered: boolean
  ): number {
    if (staggered) {
      if(type != DiceType.Pure) return 2 * amount;
      return amount;
    } 
    switch (type) {
      case DiceType.Slash:
        return isStagger
          ? amount * (1 - this.SlashStagger / 100)
          : amount * (1 - this.SlashHP / 100);
      case DiceType.Pierce:
        return isStagger
          ? amount * (1 - this.PierceStagger / 100)
          : amount * (1 - this.PierceHP / 100);
      case DiceType.Blunt:
        return isStagger
          ? amount * (1 - this.BluntStagger / 100)
          : amount * (1 - this.BluntHP / 100);
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

  takeDamage(dmgtype: DiceType, type: AttackType, amount: number): void {
    if (type === AttackType.HP || type === AttackType.Mixed) {
      const damageToHealth = this.resistance.calculateDamage(
        dmgtype,
        amount,
        false,
        this.staggered
      );
      this.currentHP -= damageToHealth;
      if (this.currentHP < 0) this.currentHP = 0;
    }
    if (type === AttackType.Stagger || type === AttackType.Mixed) {
      const damageToStagger = this.resistance.calculateDamage(
        dmgtype,
        amount,
        true,
        this.staggered
      );
      this.currentStagger -= damageToStagger;
      if (this.currentStagger <= 0) {
        this.currentStagger = 0;
        this.stagger();
      }
    }
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
