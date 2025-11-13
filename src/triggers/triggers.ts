import { ResultMessage } from "#results/resultlist";

export namespace CombatTriggers {
  export interface endOfScene {
    endOfScene(): ResultMessage;
  }

  export interface CombatStart {
    combatStart(): ResultMessage;
  }

  export interface OnPlay {
    onPlay(): ResultMessage;
  }

  export interface OnUse {
    onUse(): ResultMessage;
  }

  export interface DiceRoll {
    onDiceRoll(): ResultMessage;
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

  export interface Death {
    onDeath(): ResultMessage;
  }
}
