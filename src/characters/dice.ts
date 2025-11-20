export class SpeedDice {
    minroll : number;
    maxroll : number;
    broken : boolean = false;
    locked : boolean = false;
    roll : number;
    constructor(minroll: number, maxroll: number) {
        this.minroll = minroll;
        this.maxroll = maxroll;
        this.roll = -1;
    }

    doRoll(modifier: number = 0) : number {
        if (this.broken || this.locked) {
            return -1;
        }
        this.roll = Math.floor(Math.random() * (this.maxroll - this.minroll + 1)) + this.minroll + modifier;
        return this.roll;
    }

    reset() {
        this.roll = -1;
    }

}