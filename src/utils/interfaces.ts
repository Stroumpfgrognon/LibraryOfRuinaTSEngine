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
    ((Object.keys(value) as (keyof T)[]).every((key) => keys.includes(key)) ||
      bypassCheckB) //  Ensure no undefined keys are present
  );
};

export function isCombatStart(value: any) {
  return isTSInterface<CombatTriggers.CombatStart>(
    value,
    ["combatStart"],
    ["combatStart"],
    true
  );
}

export function isOnUse(value: any) {
  return isTSInterface<CombatTriggers.OnUse>(value, ["onUse"], ["onUse"], true);
}
