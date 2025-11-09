export enum TargetType {
  SELF,
  ALLIES,
  ENNEMIES,
  PAGE_TARGETS,
  ALL,
}

export namespace Targetting {
  export class Target {
    type: TargetType;
    amount: number;

    constructor(type: TargetType, amount: number) {
      this.type = type;
      this.amount = amount;
    }
  }

  export class PageTargets extends Target {
    constructor(amount: number = 1000) {
      super(TargetType.PAGE_TARGETS, amount);
    }
  }

  export class SingleTarget extends Target {
    constructor() {
      super(TargetType.SELF, 1);
    }
  }

  export class SelfTarget extends Target {
    constructor() {
      super(TargetType.SELF, 1);
    }
  }

  export class AllTarget extends Target {
    constructor(amount: number = 1000) {
      super(TargetType.ALL, amount);
    }
  }

  export class AlliesTarget extends Target {
    constructor(amount: number = 1000) {
      super(TargetType.ALLIES, amount);
    }
  }

  export class EnnemiesTarget extends Target {
    constructor(amount: number = 1000) {
      super(TargetType.ENNEMIES, amount);
    }
  }
}
