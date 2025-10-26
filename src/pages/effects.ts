import { CombatTriggers } from "../@types/triggers";
import { RollResultMessage } from "../@types/resultlist";

export class DiceRollEffect {
  description: string;

  constructor(description: string) {
    this.description = description;
  }
}

export class OnHitEffect
  extends DiceRollEffect
  implements CombatTriggers.onHitTrigger
{
  effect: RollResultMessage;
  constructor(description: string, effect: RollResultMessage) {
    super(description);
    this.effect = effect;
  }

  onHit() {
    return this.effect;
  }
}

export class OnClashWinEffect
  extends DiceRollEffect
  implements CombatTriggers.onClashWinTrigger
{
  effect: RollResultMessage;
  constructor(description: string, effect: RollResultMessage) {
    super(description);
    this.effect = effect;
  }
  onClashWin() {
    return this.effect;
  }
}

export class OnClashLoseEffect
  extends DiceRollEffect
  implements CombatTriggers.onClashLoseTrigger
{
  effect: RollResultMessage
    constructor(description: string, effect: RollResultMessage) {
    super(description);
    this.effect = effect;
  }
    onClashLose() {
    return this.effect;
  }
}

export class OnDiceRollEffect
  extends DiceRollEffect
  implements CombatTriggers.diceRollTrigger
{
  effect: RollResultMessage;
  constructor(description: string, effect: RollResultMessage) {
    super(description);
    this.effect = effect;
  }
  onDiceRoll() {
    return this.effect;
  }
}

export class PageEffect {
    
}