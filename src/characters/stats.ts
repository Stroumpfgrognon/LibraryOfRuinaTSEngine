export class TurnStats {
    atkPowerAdd: number;
    atkPowerMult: number;
    defPowerAdd: number;
    defPowerMult: number;
    speedAdd: number;

    constructor() {
        this.atkPowerAdd = 0;
        this.atkPowerMult = 1;
        this.defPowerAdd = 0;
        this.defPowerMult = 1;
        this.speedAdd = 0;
    }

    reset() {
        this.atkPowerAdd = 0;
        this.atkPowerMult = 1;
        this.defPowerAdd = 0;
        this.defPowerMult = 1;
        this.speedAdd = 0;
    }
}