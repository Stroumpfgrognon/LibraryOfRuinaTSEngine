import { ResultMessage } from "./resultlist";

export namespace CombatTriggers {
  export interface endOfSceneTrigger {
    endOfScene(): ResultMessage | void;
  }

  export interface combatStartTrigger {
    combatStart(): ResultMessage | void;
  }

  export interface onUseTrigger {
    onUse(): ResultMessage | void;
  }

  export interface diceRollTrigger {
    onDiceRoll(): ResultMessage | void;
  }

  export interface onClashWinTrigger {
    onClashWin(): ResultMessage | void;
  }

  export interface onClashLoseTrigger {
    onClashLose(): ResultMessage | void;
  }

  export interface onHitTrigger {
    onHit(): ResultMessage | void;
  }

  export interface onHitReceivedTrigger {
    onHitReceived(): ResultMessage | void;
  }

  export interface deathTrigger {
    onDeath(): ResultMessage | void;
  }
}
