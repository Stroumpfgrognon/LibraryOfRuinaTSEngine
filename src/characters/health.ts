import { DMGType, AttackType } from "#enums/attack";
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

  calculateDamage(type: DMGType, amount: number, isStagger: boolean): number {
    switch (type) {
      case DMGType.Slash:
        return isStagger
          ? amount * (1 - this.SlashStagger / 100)
          : amount * (1 - this.SlashHP / 100);
      case DMGType.Pierce:
        return isStagger
          ? amount * (1 - this.PierceStagger / 100)
          : amount * (1 - this.PierceHP / 100);
      case DMGType.Blunt:
        return isStagger
          ? amount * (1 - this.BluntStagger / 100)
          : amount * (1 - this.BluntHP / 100);
      default:
        return amount;
    }
  }
}

export class Health {
  maxHealth: number;
  currentHealth: number;
  maxStagger: number;
  currentStagger: number;
  resistance: Resistance;

  constructor(
    maxHealth: number,
    currentHealth: number,
    maxStagger: number,
    currentStagger: number,
    resistance: Resistance
  ) {
    this.maxHealth = maxHealth;
    this.currentHealth = currentHealth;
    this.maxStagger = maxStagger;
    this.currentStagger = currentStagger;
    this.resistance = resistance;
  }

  takeDamage(dmgtype: DMGType, type: AttackType, amount: number): void {
    if (type === AttackType.HP || type === AttackType.Mixed) {
      const damageToHealth = this.resistance.calculateDamage(
        dmgtype,
        amount,
        false
      );
      this.currentHealth -= damageToHealth;
      if (this.currentHealth < 0) this.currentHealth = 0;
    }
    if (type === AttackType.Stagger || type === AttackType.Mixed) {
      const damageToStagger = this.resistance.calculateDamage(
        dmgtype,
        amount,
        true
      );
      this.currentStagger -= damageToStagger;
      if (this.currentStagger < 0) this.currentStagger = 0;
    }
  }
}
