/**
 * Defines effect types for statuses like Burn or Bleed.
 * Some values can be negative and consequence depends on context and combat phase
 */
export enum EffectType {
  Damage,
  StaggerDamage,
  IncreaseDamage,
  IncreaseRollOffensive,
  /**If present, at 0 minimizes roll, at 1 maximizes roll*/
  MaximiseRollOffensive,
  IncreaseRollDefensive,
  /** If present, at 0 minimizes roll, at 1 maximizes roll */
  MaximiseRollDefensive,
  IncreaseSpeed,
  NullifyPower,
  Immobilize,
  Stagger,
  ExpungeStatus, // Used to remove a status effect
  InflictStatus, // Used to add a status effect
}
