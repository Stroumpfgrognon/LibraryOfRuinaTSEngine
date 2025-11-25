import { ResultMessage } from "#results/resultlist";
import { DiceRoll } from "#pages/dice";
import { Clash } from "#reception/clash";
import { Side } from "#enums/attack";

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
    onUse(clash : Clash, side: Side): ResultMessage;
  }

  export interface OnDiceRoll {
    onDiceRoll(roll : DiceRoll | null, result : number): ResultMessage;
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
