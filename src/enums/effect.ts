/**
 * Defines effect types for statuses like Burn or Bleed.
 * Some values can be negative and consequence depends on context and combat phase
 */
export enum EffectType {
  Damage,
  StaggerDamage,
  IncreaseDamageReceived,
  IncreaseSTDamageReceived,
  AddDamageMult,
  AddSTDamageMult,
  IncreaseDamageDealt,
  AddDamageDealtMult,
  IncreaseSTDamageDealt,
  AddSTDamageDealtMult,
  IncreaseRollOffensive,
  IncreaseRollDefensive,
  IncreaseSpeed,
  NullifyPower,
  Immobilize,
  Stagger,
  ExpungeStatus, // Used to remove a status effect
  InflictStatus, // Used to add a status effect
}
