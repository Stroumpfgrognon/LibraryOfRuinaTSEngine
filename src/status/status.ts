import { StatusResult } from "#results/results";

export class StatusEffect {
  name: string;
  icon: string;
  description: string;
  countable: boolean;
  count: number;
  hidden: boolean;
  nextScene: boolean = false;

  constructor(
    name: string,
    icon: string,
    description: string,
    countable: boolean,
    count: number,
    hidden: boolean,
    nextScene: boolean
  ) {
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.countable = countable;
    this.count = count;
    this.hidden = hidden;
    this.nextScene = nextScene;
  }

  getDescription(): string {
    return this.description.replace(" X ", ` ${this.count} `);
  }
}

// Defines statuses that change count at every end of scene
export interface ExpiringStatus {
  expire(): StatusResult | null;
}

export interface ChargeLikeStatus {
  useCharge(amount: number, force: boolean): boolean;
}
