import { Page } from "#pages/pages";

export class CombatResult {
    pageAlly : Page;
    pageEnemy : Page;
    constructor(pageAlly : Page, pageEnemy : Page) {
        this.pageAlly = pageAlly;
        this.pageEnemy = pageEnemy;
    }
}
