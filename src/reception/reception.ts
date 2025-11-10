import { Character } from "#characters/characters";
import { ClashAttack, Clash } from "./clash";
import { randomInt } from "#utils/random";

export class Reception {
  allies: Character[];
  enemies: Character[];
  selectedCharacter: Character | null = null;
  selectedAlly: Character | null = null;
  selectedDiceNumber: number | null = 0;
  /**  Used to cache clashes */
  clashToDate: boolean = false; 
  clashes: Clash[] = [];
  constructor(allies: Character[], enemies: Character[]) {
    this.allies = allies;
    this.enemies = enemies;
    this.enemiesStart();
    this.alliesStart();
  }

  enemiesStart(): void {
    for (let enemy of this.enemies) {
      enemy.startOfScene();
    }

    for (let enemy of this.enemies) {
      enemy.hand.sort((page1, page2) => page2.cost - page1.cost);
      let currentDice = 0;
      for (let i = 0; i < enemy.hand.length; i++) {
        if (enemy.lightengine.lightPoints >= enemy.hand[i].cost) {
          let target = randomInt(0, this.allies.length - 1);
          let targetDice = randomInt(0, this.allies[target].dices.length - 1);
          enemy.playPage(i, currentDice, target, targetDice);
        }
      }
    }
  }

  alliesStart(): void {
    for (let ally of this.allies) {
      ally.startOfScene();
    }
  }

  playPageAlly(
    allyIndex: number,
    pageIndex: number,
    diceIndex: number,
    enemyIndex: number,
    enemyDiceIndex: number
  ) : void {
    this.allies[allyIndex].playPage(pageIndex,diceIndex,enemyIndex,enemyDiceIndex);
    this.clashToDate=false;
  };

  unplayPageAlly(allyIndex: number, diceIndex : number) : void {
    this.allies[allyIndex].unplayPage(diceIndex);
    this.clashToDate=false;
  }

  resolveClashes(): Clash[] | void {
    if (this.clashToDate) return this.clashes;
    console.log("Updating clashes")
    let attacks: ClashAttack[] = [];
    for (let j = 0; j < this.enemies.length; j++) {
      for (let attack of this.enemies[j].attacks) {
        attacks.push(
          new ClashAttack(
            attack,
            j,
            "enemy",
            this.enemies[j].dices[attack.diceIndex].roll
          )
        );
      }
    }
    for (let j = 0; j < this.allies.length; j++) {
      for (let attack of this.allies[j].attacks) {
        attacks.push(
          new ClashAttack(
            attack,
            j,
            "ally",
            this.allies[j].dices[attack.diceIndex].roll
          )
        );
      }
    }
    attacks.sort(
      (a, b) =>
        b.speed +
        0.5 * (b.side == "enemy" ? 1 : 0) -
        a.speed -
        0.5 * (a.side == "enemy" ? 1 : 0)
    );
    let clashes: Clash[] = [];

    for (let attack of attacks) {
      if (attack.side == "ally") {
        let clashed = false;
        for (let clash of clashes) {
          if (
            clash.attackA.side == "enemy" &&
            clash.attackA.attack.enemyIndex == attack.characterIndex &&
            clash.attackA.attack.enemyDiceIndex == attack.attack.diceIndex &&
            attack.attack.enemyDiceIndex == clash.attackA.attack.diceIndex
          ) {
            if (clash.doClash(attack)) {
              clashed = true;
              continue;
            }
          }
        }
        if (!clashed) {
          clashes.push(new Clash(attack, null));
        }
      }
      if (attack.side == "enemy") {
        let clashed = false;
        for (let clash of clashes) {
          if (
            clash.attackA.side == "ally" &&
            clash.attackA.attack.enemyIndex == attack.characterIndex &&
            clash.attackA.attack.enemyDiceIndex == attack.attack.diceIndex
          ) {
            if (clash.doClash(attack)) {
              clashed = true;
              break;
            }
          }
        }
        if (!clashed) {
          clashes.push(new Clash(attack, null));
        }
      }
    }
    this.clashes = clashes;
    this.clashToDate = true;
    return clashes;
  }
}
