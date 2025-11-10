export class Attack {
    pageIndex: number;
    diceIndex: number;
    enemyIndex: number;
    enemyDiceIndex: number;

    constructor(pageIndex: number, diceIndex: number, enemyIndex: number, enemyDiceIndex: number) {
        this.pageIndex = pageIndex;
        this.diceIndex = diceIndex;
        this.enemyIndex = enemyIndex;
        this.enemyDiceIndex = enemyDiceIndex;
    }
}