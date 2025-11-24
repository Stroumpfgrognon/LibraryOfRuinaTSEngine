import { AttackRange } from "#enums/attack";

let attackindex = 0;
export class Attack {
    index : number;
    pageIndex: number;
    diceIndex: number;
    foeIndex: number;
    foeDiceIndex: number;
    attackRange : AttackRange;

    constructor(pageIndex: number, diceIndex: number, foeIndex: number, foeDiceIndex: number, attackRange : AttackRange) {
        this.index = attackindex++;
        this.pageIndex = pageIndex;
        this.diceIndex = diceIndex;
        this.foeIndex = foeIndex;
        this.foeDiceIndex = foeDiceIndex;
        this.attackRange = attackRange;
    }

    static massTarget(enemyIndex: number, enemyDiceIndex: number) : Attack {
        return new Attack(-1, -1, enemyIndex, enemyDiceIndex, AttackRange.Mass);
    }
}