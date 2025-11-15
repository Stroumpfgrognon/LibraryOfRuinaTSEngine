export enum DiceType {
  Slash,
  Pierce,
  Blunt,
  Dodge,
  Block,
  Pure
}

export enum AttackType {
  HP,
  Stagger,
  Mixed,
}

export enum Side {
  Ally,
  Enemy,
}

export enum TriggerText {
  EndOfScene = "End of Scene",
  CombatStart = "Combat Start",
  OnUse = "On Use",
  OnDiceRoll = "On Dice Roll",
  OnClashWin = "On Clash Win",
  OnClashLose = "On Clash Lose",
  OnHit = "On Hit",
  OnHitReceived = "On Hit Received",
  OnDeath = "On Death",
}
