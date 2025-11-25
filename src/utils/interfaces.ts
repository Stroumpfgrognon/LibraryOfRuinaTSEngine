import { CombatTriggers } from "#triggers/triggers";

/** Code taken from Tamás Polgár from https://medium.com/developer-rants/follow-up-how-to-tell-if-an-object-conforms-to-a-typescript-interface-f99b4b77d602
 *
 * Checks wether or not a type comforms to a given interface
 */

export const isTSInterface = <T>(
  value: any,
  keys: (keyof T)[],
  requiredKeys: (keyof T)[],
  bypassCheckB: boolean = false // used if the interface is checked with its methods (like triggers)
): value is T => {
  if (typeof value !== "object" || value === null) return false;
  return (
    requiredKeys.every((key) => key in value) &&
    ((Object.keys(value) as (keyof T)[]).every((key) => keys.includes(key)) || bypassCheckB) //  Ensure no undefined keys are present
  );
};

export function isCombatStart(value: any): value is CombatTriggers.OnCombatStart {
  return isTSInterface<CombatTriggers.OnCombatStart>(value, ["onCombatStart"], ["onCombatStart"], true);
}

export function isOnUse(value: any): value is CombatTriggers.OnUse {
  return isTSInterface<CombatTriggers.OnUse>(value, ["onUse"], ["onUse"], true);
}

export function isOnDiceRoll(value: any): value is CombatTriggers.OnDiceRoll {
  return isTSInterface<CombatTriggers.OnDiceRoll>(value, ["onDiceRoll"], ["onDiceRoll"], true);
}

export function isOnHit(value: any): value is CombatTriggers.OnHit {
  return isTSInterface<CombatTriggers.OnHit>(value, ["onHit"], ["onHit"], true);
}

export function isOnHitReceived(value: any): value is CombatTriggers.OnHitReceived {
  return isTSInterface<CombatTriggers.OnHitReceived>(value, ["onHitReceived"], ["onHitReceived"], true);
}

export function isOnDeath(value: any): value is CombatTriggers.OnDeath {
  return isTSInterface<CombatTriggers.OnDeath>(value, ["onDeath"], ["onDeath"], true);
}

export function isOnClashWin(value: any): value is CombatTriggers.OnClashWin {
  return isTSInterface<CombatTriggers.OnClashWin>(value, ["onClashWin"], ["onClashWin"], true);
}

export function isOnClashLose(value: any): value is CombatTriggers.OnClashLose {
  return isTSInterface<CombatTriggers.OnClashLose>(value, ["onClashLose"], ["onClashLose"], true);
}

export function isEndOfScene(value: any): value is CombatTriggers.endOfScene {
  return isTSInterface<CombatTriggers.endOfScene>(value, ["endOfScene"], ["endOfScene"], true);
}

export function isOnPlay(value: any): value is CombatTriggers.OnPlay {
  return isTSInterface<CombatTriggers.OnPlay>(value, ["onPlay"], ["onPlay"], true);
}