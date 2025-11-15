import { ResultMessage } from "#results/resultlist";
import { DiceRoll } from "#pages/roll";

export namespace CombatTriggers {
  export interface endOfScene {
    endOfScene(): ResultMessage;
  }

  export interface OnCombatStart {
    onCombatStart(): ResultMessage;
  }

  export interface OnPlay {
    onPlay(): ResultMessage;
  }

  export interface OnUse {
    onUse(): ResultMessage;
  }

  export interface OnDiceRoll {
    onDiceRoll(roll : DiceRoll | null): ResultMessage;
  }

  export interface OnAfterDiceRoll {
    onAfterDiceRoll(roll : DiceRoll | null): ResultMessage;
  }

  export interface OnClashWin {
    onClashWin(): ResultMessage;
  }

  export interface OnClashLose {
    onClashLose(): ResultMessage;
  }

  export interface OnHit {
    onHit(): ResultMessage;
  }

  export interface OnHitReceived {
    onHitReceived(): ResultMessage;
  }

  export interface OnDeath {
    onDeath(): ResultMessage;
  }
}
