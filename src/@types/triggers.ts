import { ResultMessage } from "./resultlist";

export namespace CombatTriggers {
  export interface endOfScene {
    endOfScene(): ResultMessage | void;
  }

  export interface CombatStart {
    combatStart(): ResultMessage | void;
  }

  export interface OnPlay {
    onPlay(): ResultMessage | void;
  }

  export interface OnUse {
    onUse(): ResultMessage | void;
  }

  export interface DiceRoll {
    onDiceRoll(): ResultMessage | void;
  }

  export interface OnClashWin {
    onClashWin(): ResultMessage | void;
  }

  export interface OnClashLose {
    onClashLose(): ResultMessage | void;
  }

  export interface OnHit {
    onHit(): ResultMessage | void;
  }

  export interface OnHitReceived {
    onHitReceived(): ResultMessage | void;
  }

  export interface Death {
    onDeath(): ResultMessage | void;
  }
}
