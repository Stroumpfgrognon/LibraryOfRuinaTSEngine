import { CombatTriggers } from "#triggers/triggers";
import { PageResultMessage } from "#results/resultlist";

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
    effect: PageResultMessage;
    constructor(description: string, effect: PageResultMessage) {
      super(description);
      this.effect = effect;
    }

    onHit() {
      return this.effect;
    }
  }

  export class OnClashWin extends Effect implements CombatTriggers.OnClashWin {
    effect: PageResultMessage;
    constructor(description: string, effect: PageResultMessage) {
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
    effect: PageResultMessage;
    constructor(description: string, effect: PageResultMessage) {
      super(description);
      this.effect = effect;
    }
    onClashLose() {
      return this.effect;
    }
  }

  export class OnDiceRoll extends Effect implements CombatTriggers.OnDiceRoll {
    effect: PageResultMessage;
    constructor(description: string, effect: PageResultMessage) {
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
    implements CombatTriggers.OnCombatStart
  {
    effect: PageResultMessage;
    constructor(description: string, effect: PageResultMessage) {
      super(description);
      this.effect = effect;
    }

    onCombatStart() {
      return this.effect;
    }
  }

  export class OnUse extends Effect implements CombatTriggers.OnUse {
    effect: PageResultMessage;
    constructor(description: string, effect: PageResultMessage) {
      super(description);
      this.effect = effect;
    }

    onUse() {
      return this.effect;
    }
  }

  export class OnPlay extends Effect implements CombatTriggers.OnPlay {
    effect: PageResultMessage;
    constructor(description: string, effect: PageResultMessage) {
      super(description);
      this.effect = effect;
    }

    onPlay() {
      return this.effect;
    }
  }
}
