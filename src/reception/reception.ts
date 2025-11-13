import { Character } from "#characters/characters";
import { ClashAttack, Clash } from "./clash";
import { randomInt, shallowShuffleCopy } from "#utils/random";
import { Page } from "#pages/pages";
import { isOnUse } from "#utils/interfaces";
import { AttackSide, AttackType, DMGType } from "#enums/attack";
import { ResultMessage } from "#results/resultlist";
import { TargetType } from "#results/targets";
import { EffectType } from "#enums/effect";
import { RollResultWithStatus } from "#results/results";

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
      if (enemy.dead) continue;
      enemy.hand.sort((page1, page2) => page2.cost - page1.cost);
      let currentDice = 0;
      for (let i = 0; i < enemy.hand.length; i++) {
        if (currentDice >= enemy.dices.length) break;
        if (enemy.lightengine.lightPoints >= enemy.hand[i].cost) {
          let target = randomInt(0, this.allies.length - 1);
          let targetDice = randomInt(0, this.allies[target].dices.length - 1);
          enemy.playPage(i, currentDice, target, targetDice);
          currentDice++;
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
  ): void {
    this.allies[allyIndex].playPage(
      pageIndex,
      diceIndex,
      enemyIndex,
      enemyDiceIndex
    );
    this.clashToDate = false;
  }

  unplayPageAlly(allyIndex: number, diceIndex: number): void {
    this.allies[allyIndex].unplayPage(diceIndex);
    this.clashToDate = false;
  }

  /** Resolves clashes from the original character attacks.
   *  Caches result to prevent re-calculation on subsequent calls (mainly for targetting display.)
   */
  resolveClashes(): Clash[] | void {
    if (this.clashToDate) return this.clashes;
    console.log("Updating clashes");
    let attacks: ClashAttack[] = [];
    for (let j = 0; j < this.enemies.length; j++) {
      for (let attack of this.enemies[j].attacks) {
        attacks.push(
          new ClashAttack(
            attack,
            j,
            AttackSide.Enemy,
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
            AttackSide.Ally,
            this.allies[j].dices[attack.diceIndex].roll
          )
        );
      }
    }
    attacks.sort(
      (a, b) =>
        b.speed +
        0.5 * (b.side == AttackSide.Enemy ? 1 : 0) -
        a.speed -
        0.5 * (a.side == AttackSide.Enemy ? 1 : 0)
    );
    let clashes: Clash[] = [];

    for (let attack of attacks) {
      if (attack.side == AttackSide.Ally) {
        let clashed = false;
        for (let clash of clashes) {
          if (
            clash.attackA.side == AttackSide.Enemy &&
            clash.attackA.characterIndex == attack.attack.enemyIndex &&
            clash.attackA.attack.enemyDiceIndex == attack.attack.diceIndex &&
            attack.attack.enemyDiceIndex == clash.attackA.attack.diceIndex
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
      if (attack.side == AttackSide.Enemy) {
        let potentialClashes = clashes.filter(
          (clash) =>
            clash.attackA.side == AttackSide.Ally &&
            clash.attackA.attack.enemyIndex == attack.characterIndex &&
            clash.attackA.attack.enemyDiceIndex == attack.attack.diceIndex &&
            clash.attackB == null
        );
        if (potentialClashes.length >= 1) {
          potentialClashes.sort(
            (a, b) => b.attackA.attack.index - a.attackA.attack.index
          );
          potentialClashes[0].doClash(attack);
        } else {
          clashes.push(new Clash(attack, null));
        }
      }
    }
    this.clashes = clashes;
    this.clashToDate = true;
    console.log(clashes);
    return clashes;
  }

  combat(): void {
    if (!this.clashToDate) {
      this.resolveClashes();
    }

    for (let clash of this.clashes) {
      let clashAlly: ClashAttack | null = null;
      let clashEnemy: ClashAttack | null = null;
      let pageAlly: Page | null = null;
      let pageEnemy: Page | null = null;
      if (clash.attackA.side === AttackSide.Ally) {
        clashAlly = clash.attackA;
        pageAlly =
          this.allies[clash.attackA.characterIndex].hand[
            clash.attackA.attack.pageIndex
          ];
        if (clash.attackB) {
          clashEnemy = clash.attackB;
          pageEnemy =
            this.enemies[clash.attackB.characterIndex].hand[
              clash.attackB.attack.pageIndex
            ];
        }
      } else {
        clashEnemy = clash.attackA;
        pageEnemy =
          this.enemies[clash.attackA.characterIndex].hand[
            clash.attackA.attack.pageIndex
          ];
        if (clash.attackB) {
          clashAlly = clash.attackB;
          pageAlly =
            this.allies[clash.attackB.characterIndex].hand[
              clash.attackB.attack.pageIndex
            ];
        }
      }
      if (clashAlly && pageAlly) {
        if (isOnUse(pageAlly.pageEffect)) {
          this.handleEffect(
            pageAlly.pageEffect.onUse(),
            AttackSide.Ally,
            clashAlly.characterIndex,
            clashEnemy ? clashEnemy.characterIndex : clashAlly.attack.enemyIndex
          );
        }
      }
      if (clashEnemy && pageEnemy) {
        if (isOnUse(pageEnemy.pageEffect)) {
          this.handleEffect(
            pageEnemy.pageEffect.onUse(),
            AttackSide.Enemy,
            clashEnemy.characterIndex,
            clashAlly ? clashAlly.characterIndex : clashEnemy.attack.enemyIndex
          );
        }
      }
      for (
        let i = 0;
        i <
        Math.max(
          pageAlly ? pageAlly.rolls.length : 0,
          pageEnemy ? pageEnemy.rolls.length : 0
        );
        i++
      ) {
        // let diceAlly = pageAlly ? pageAlly.rolls[i] : null;
        // let diceEnemy = pageEnemy ? pageEnemy.rolls[i] : null;
      }
    }
  }
  /** A huge function to handle all effects from pages to statuses */
  handleEffect(
    effects: ResultMessage,
    side: AttackSide,
    originIndex: number,
    targetIndex: number
  ) {
    for (let effect of effects.results) {
      switch (effect.type) {
        case EffectType.Damage:
          if (effect.target.type == TargetType.SELF) {
            if (side == AttackSide.Ally) {
              this.enemies[originIndex].doDamage(
                DMGType.Pure,
                AttackType.HP,
                effect.value
              );
            }
            if (side == AttackSide.Enemy) {
              this.allies[originIndex].doDamage(
                DMGType.Pure,
                AttackType.HP,
                effect.value
              );
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == AttackSide.Ally) {
              this.enemies[targetIndex].doDamage(
                DMGType.Pure,
                AttackType.HP,
                effect.value
              );
            }
            if (side == AttackSide.Enemy) {
              this.allies[targetIndex].doDamage(
                DMGType.Pure,
                AttackType.HP,
                effect.value
              );
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = effect.target.amount;
            if (side == AttackSide.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.doDamage(DMGType.Pure, AttackType.HP, effect.value))
                  limit--;
              }
            }
            if (side == AttackSide.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.doDamage(DMGType.Pure, AttackType.HP, effect.value))
                  limit--;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = effect.target.amount;
            if (side == AttackSide.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.doDamage(DMGType.Pure, AttackType.HP, effect.value))
                  limit--;
              }
            }
            if (side == AttackSide.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.doDamage(DMGType.Pure, AttackType.HP, effect.value))
                  limit--;
              }
            }
          }
          break;
        case EffectType.InflictStatus:
          if (effect instanceof RollResultWithStatus) {
            if (effect.target.type == TargetType.SELF) {
              if (side == AttackSide.Ally) {
                this.allies[originIndex].inflictStatus(effect.statusType);
              }
              if (side == AttackSide.Enemy) {
                this.enemies[originIndex].inflictStatus(effect.statusType);
              }
            } else if (effect.target.type == TargetType.PAGE_TARGETS) {
              if (side == AttackSide.Ally) {
                this.enemies[targetIndex].inflictStatus(effect.statusType);
              }
            } else if (effect.target.type == TargetType.ALLIES) {
              let limit = effect.target.amount;
              if (side == AttackSide.Enemy) {
                for (let enemy of shallowShuffleCopy(this.enemies)) {
                  if (limit <= 0) break;
                  if (enemy.inflictStatus(effect.statusType)) limit--;
                }
              }
              if (side == AttackSide.Ally) {
                for (let ally of shallowShuffleCopy(this.allies)) {
                  if (limit <= 0) break;
                  if (ally.inflictStatus(effect.statusType)) limit--;
                }
              }
            } else if (effect.target.type == TargetType.ENNEMIES) {
              let limit = effect.target.amount;
              if (side == AttackSide.Ally) {
                for (let enemy of shallowShuffleCopy(this.enemies)) {
                  if (limit <= 0) break;
                  if (enemy.inflictStatus(effect.statusType)) limit--;
                }
              }
              if (side == AttackSide.Enemy) {
                for (let ally of shallowShuffleCopy(this.allies)) {
                  if (limit <= 0) break;
                  if (ally.inflictStatus(effect.statusType)) limit--;
                }
              }
            }
          }
      }
    }
  }
}
