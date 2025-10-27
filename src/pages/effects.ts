import { CombatTriggers } from "#types/triggers";
import { RollResultMessage } from "#types/resultlist";

export namespace DiceEffect {
  export class Effect {
    description: string;

    constructor(description: string) {
      this.description = description;
    }
  }

  export class NullEffect extends Effect {
    constructor() {
      super("");
    }
  }

  export class OnHit extends Effect implements CombatTriggers.OnHit {
    effect: RollResultMessage;
    constructor(description: string, effect: RollResultMessage) {
      super(description);
      this.effect = effect;
    }

    onHit() {
      return this.effect;
    }
  }

  export class OnClashWin extends Effect implements CombatTriggers.OnClashWin {
    effect: RollResultMessage;
    constructor(description: string, effect: RollResultMessage) {
      super(description);
      this.effect = effect;
    }
    onClashWin() {
      return this.effect;
    }
  }

  export class OnClashLose
    extends Effect
    implements CombatTriggers.OnClashLose
  {
    effect: RollResultMessage;
    constructor(description: string, effect: RollResultMessage) {
      super(description);
      this.effect = effect;
    }
    onClashLose() {
      return this.effect;
    }
  }

  export class OnDiceRoll extends Effect implements CombatTriggers.DiceRoll {
    effect: RollResultMessage;
    constructor(description: string, effect: RollResultMessage) {
      super(description);
      this.effect = effect;
    }
    onDiceRoll() {
      return this.effect;
    }
  }
}

export namespace PageEffect {
  export class Effect {
    description: string;

    constructor(description: string) {
      this.description = description;
    }
  }

  export class NullEffect extends Effect {
    constructor() {
      super("");
    }
  }

  export class CombatStart
    extends Effect
    implements CombatTriggers.CombatStart
  {
    effect: RollResultMessage;
    constructor(description: string, effect: RollResultMessage) {
      super(description);
      this.effect = effect;
    }

    combatStart() {
      return this.effect;
    }
  }

  export class OnUse extends Effect implements CombatTriggers.OnUse {
    effect: RollResultMessage;
    constructor(description: string, effect: RollResultMessage) {
      super(description);
      this.effect = effect;
    }

    onUse() {
      return this.effect;
    }
  }

  export class OnPlay extends Effect implements CombatTriggers.OnPlay {
    effect: RollResultMessage;
    constructor(description: string, effect: RollResultMessage) {
      super(description);
      this.effect = effect;
    }

    onPlay() {
      return this.effect;
    }
  }
}
