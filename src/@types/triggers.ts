import { StatusResultMessage } from "./results";

export namespace StatusEffectsTriggers {
  export interface endOfSceneTrigger {
    endOfScene(): StatusResultMessage | void;
  }

  export interface combatStartTrigger {
    combatStart(): StatusResultMessage | void;
  }

  export interface onUseTrigger {
    onUse(): StatusResultMessage | void;
  }

  export interface diceRollTrigger {
    onDiceRoll(): StatusResultMessage | void;
  }

  export interface onClashWinTrigger {
    onClashWin(): StatusResultMessage | void;
  }

  export interface onClashLoseTrigger {
    onClashLose(): StatusResultMessage | void;
  }

  export interface onHitTrigger {
    onHit(): StatusResultMessage | void;
  }

  export interface onHitReceivedTrigger {
    onHitReceived(): StatusResultMessage | void;
  }

  export interface deathTrigger {
    onDeath(): StatusResultMessage | void;
  }
}
