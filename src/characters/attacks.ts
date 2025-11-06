export class Attack {
    pageIndex: number;
    diceIndex: number;
    ennemyIndex: number;
    ennemyDiceIndex: number;

    constructor(pageIndex: number, diceIndex: number, ennemyIndex: number, ennemyDiceIndex: number) {
        this.pageIndex = pageIndex;
        this.diceIndex = diceIndex;
        this.ennemyIndex = ennemyIndex;
        this.ennemyDiceIndex = ennemyDiceIndex;
    }
}