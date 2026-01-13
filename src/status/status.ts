import { StatusResult } from "#results/results";

export class StatusDisplay {
  name: string;
  icon: string;
  description: string;
  count: number | null;
  visible: boolean;

  constructor(name: string, icon: string, description: string, count: number | null, visible: boolean) {
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.count = count;
    this.visible = visible;
  }
}

export class StatusEffect {
  name: string;
  icon: string;
  description: string;
  countable: boolean;
  count: number;
  maxCount: number;
  hidden: boolean;
  nextScene: boolean = false;

  constructor(
    name: string,
    icon: string,
    description: string,
    countable: boolean,
    count: number,
    maxCount: number,
    hidden: boolean,
    nextScene: boolean
  ) {
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.countable = countable;
    this.count = count;
    this.maxCount = maxCount;
    this.hidden = hidden;
    this.nextScene = nextScene;
  }

  getDescription(): string {
    return this.description.replace(" X ", ` ${this.count} `);
  }

  addCount(amount: number) {
    if (this.countable) {
      this.count = Math.max(0, Math.min(this.count + amount, this.maxCount));
    }
  }

  clone(): StatusEffect {
    return new StatusEffect(
      this.name,
      this.icon,
      this.description,
      this.countable,
      this.count,
      this.maxCount,
      this.hidden,
      this.nextScene
    );
  }
}

// Defines statuses that change count at every end of scene
export interface ExpiringStatus {
  expire(): StatusResult | null;
}

export interface ChargeLikeStatus {
  useCharge(amount: number, force: boolean): boolean;
}
