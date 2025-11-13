
let attackindex = 0;
export class Attack {
    index : number;
    pageIndex: number;
    diceIndex: number;
    enemyIndex: number;
    enemyDiceIndex: number;

    constructor(pageIndex: number, diceIndex: number, enemyIndex: number, enemyDiceIndex: number) {
        this.index = attackindex++;
        this.pageIndex = pageIndex;
        this.diceIndex = diceIndex;
        this.enemyIndex = enemyIndex;
        this.enemyDiceIndex = enemyDiceIndex;
    }
}