export enum StatusEffectType {
    /**
     * Defines effect types for statuses like Burn or Bleed.
     * Every value can be negative and consequence depends on context and combat phase
     */
    Damage,
    StaggerDamage,
    IncreaseDamage,
    IncreaseRollOffensive,
    MaximiseRollOffensive, // If present, at 0 minimizes roll, at 1 maximizes roll
    IncreaseRollDefensive,
    MaximiseRollDefensive, // If present, at 0 minimizes roll, at 1 maximizes roll
    IncreaseSpeed,
    NullifyPower,
    Immobilize,
    Stagger,
    ExpungeStatus, // Used to remove a status effect

}