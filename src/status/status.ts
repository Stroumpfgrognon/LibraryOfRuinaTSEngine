import { StatusResult } from "#results/results";

export class StatusEffect {
  name: string;
  icon: string;
  description: string;
  countable: boolean;
  count: number;
  hidden: boolean;

  constructor(
    name: string,
    icon: string,
    description: string,
    countable: boolean = false,
    count: number = 0,
    hidden: boolean = false
  ) {
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.countable = countable;
    this.count = count;
    this.hidden = hidden;
  }

  getDescription(): string {
    return this.description;
  }
}

export interface ExpiringStatus {
  expire(): StatusResult | null;
}

export interface ChargeLikeStatus {
  useCharge(amount: number, force: boolean): boolean;
}
