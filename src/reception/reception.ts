import { Character } from "#characters/characters";
import { ClashAttack, Clash } from "./clash";
import { randomInt, shallowShuffleCopy, shuffleArray } from "#utils/random";
import { Page } from "#pages/pages";
import { isOnAfterRoll, isOnRoll, isOnUse } from "#utils/interfaces";
import { Side, AttackType, DiceType } from "#enums/attack";
import { ResultMessage } from "#results/resultlist";
import { TargetType } from "#results/targets";
import { EffectType } from "#enums/effect";
import { RollResultWithStatus } from "#results/results";
import { CombatResult } from "#results/combat";

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

  playPageAlly(allyIndex: number, pageIndex: number, diceIndex: number, enemyIndex: number, enemyDiceIndex: number): void {
    this.allies[allyIndex].playPage(pageIndex, diceIndex, enemyIndex, enemyDiceIndex);
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
        attacks.push(new ClashAttack(attack, j, Side.Enemy, this.enemies[j].dices[attack.diceIndex].roll));
      }
    }
    for (let j = 0; j < this.allies.length; j++) {
      for (let attack of this.allies[j].attacks) {
        attacks.push(new ClashAttack(attack, j, Side.Ally, this.allies[j].dices[attack.diceIndex].roll));
      }
    }
    attacks.sort((a, b) => b.speed + 0.5 * (b.side == Side.Enemy ? 1 : 0) - a.speed - 0.5 * (a.side == Side.Enemy ? 1 : 0));
    let clashes: Clash[] = [];

    for (let attack of attacks) {
      if (attack.side == Side.Ally) {
        let clashed = false;
        for (let clash of clashes) {
          if (
            clash.attackA.side == Side.Enemy &&
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
      if (attack.side == Side.Enemy) {
        let potentialClashes = clashes.filter(
          (clash) =>
            clash.attackA.side == Side.Ally && clash.attackA.attack.enemyIndex == attack.characterIndex && clash.attackA.attack.enemyDiceIndex == attack.attack.diceIndex && clash.attackB == null
        );
        if (potentialClashes.length >= 1) {
          potentialClashes.sort((a, b) => b.attackA.attack.index - a.attackA.attack.index);
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
    let results: CombatResult[] = [];
    for (let clash of this.clashes) {
      let clashAlly: ClashAttack | null = null;
      let clashEnemy: ClashAttack | null = null;
      let pageAlly: Page | null = null;
      let pageEnemy: Page | null = null;
      let indexAlly: number = 0;
      let indexEnemy: number = 0;
      if (clash.attackA.side === Side.Ally) {
        clashAlly = clash.attackA;
        indexAlly = clash.attackA.characterIndex;
        pageAlly = this.allies[indexAlly].hand[clash.attackA.attack.pageIndex];
        indexEnemy = clash.attackB ? clash.attackB.characterIndex : clash.attackA.attack.enemyIndex;
        clashEnemy = clash.attackB ? clash.attackB : null;
        pageEnemy = clash.attackB ? this.enemies[indexEnemy].hand[clash.attackB.attack.pageIndex] : null;
        if (clash.attackB) {
        }
      } else {
        indexEnemy = clash.attackA.characterIndex;
        clashEnemy = clash.attackA;
        pageEnemy = this.enemies[indexEnemy].hand[clash.attackA.attack.pageIndex];
        if (clash.attackB) {
          indexAlly = clash.attackB.characterIndex;
          clashAlly = clash.attackB;
          pageAlly = this.allies[indexAlly].hand[clash.attackB.attack.pageIndex];
        }
      }
      for (let status of this.allies[indexAlly].status) {
        if (isOnUse(status)) {
          this.handleEffect(status.onUse(), Side.Ally, indexAlly, indexEnemy, true, results);
        }
      }
      for (let status of this.enemies[indexEnemy].status) {
        if (isOnUse(status)) {
          this.handleEffect(status.onUse(), Side.Enemy, indexEnemy, indexAlly, true, results);
        }
      }
      if (clashAlly && pageAlly) {
        if (isOnUse(pageAlly.pageEffect)) {
          this.handleEffect(pageAlly.pageEffect.onUse(), Side.Ally, indexAlly, indexEnemy, true, results);
        }
      }
      if (clashEnemy && pageEnemy) {
        if (isOnUse(pageEnemy.pageEffect)) {
          this.handleEffect(pageEnemy.pageEffect.onUse(), Side.Enemy, indexEnemy, indexAlly, true, results);
        }
      }
      let dicesAlly = [];
      let dicesEnemy = [];
      if (pageAlly) {
        dicesAlly = pageAlly.rolls.slice();
      }
      if (pageEnemy) {
        dicesEnemy = pageEnemy.rolls.slice();
      }
      let diceClashLimit = Math.max(dicesAlly.length, dicesEnemy.length);
      for (let i = 0; i < diceClashLimit; i++) {
        let diceAlly = pageAlly ? pageAlly.rolls[i] : null;
        let diceEnemy = pageEnemy ? pageEnemy.rolls[i] : null;
        if (diceAlly) {
          for (let effect of diceAlly.effects) {
            if (isOnRoll(effect)) this.handleEffect(effect.onDiceRoll(diceAlly), Side.Ally, indexAlly, indexEnemy, true, results);
          }
          for (let status of this.allies[indexAlly!].status) {
            if (isOnRoll(status)) this.handleEffect(status.onDiceRoll(diceAlly), Side.Ally, indexAlly, indexEnemy, true, results);
          }
        }
        if (diceEnemy) {
          for (let effect of diceEnemy.effects) {
            if (isOnRoll(effect)) this.handleEffect(effect.onDiceRoll(diceEnemy), Side.Enemy, indexEnemy, indexAlly, true, results);
          }
          for (let status of this.enemies[indexEnemy!].status) {
            if (isOnRoll(status)) this.handleEffect(status.onDiceRoll(diceEnemy), Side.Enemy, indexEnemy, indexAlly, true, results);
          }
        }
        let rollAlly: number | null = null;
        let rollEnemy: number | null = null;
        let allyData = this.allies[indexAlly].turnstat.grabStats();
        let enemyData = this.enemies[indexEnemy].turnstat.grabStats();
        if (diceAlly) {
          if (diceAlly.type == DiceType.Dodge || diceAlly.type == DiceType.Block) rollAlly = randomInt(diceAlly.rollMin, diceAlly.rollMax) + allyData!.defPowerAdd * allyData!.defPowerMult;
          else rollAlly = randomInt(diceAlly.rollMin, diceAlly.rollMax) + allyData!.atkPowerAdd * allyData!.atkPowerMult;
        }
        if (diceEnemy) {
          if (diceEnemy.type == DiceType.Dodge || diceEnemy.type == DiceType.Block) rollEnemy = randomInt(diceEnemy.rollMin, diceEnemy.rollMax) + enemyData!.defPowerAdd * enemyData!.defPowerMult;
          else rollEnemy = randomInt(diceEnemy.rollMin, diceEnemy.rollMax) + enemyData!.atkPowerAdd * enemyData!.atkPowerMult;
        }
        if (!rollAlly) rollAlly = 0;
        if (!rollEnemy) rollEnemy = 0;
        if (diceAlly && diceEnemy) {
          if (rollAlly > rollEnemy) {
            if (diceAlly.type == DiceType.Dodge && diceEnemy.type != DiceType.Dodge && diceEnemy.type != DiceType.Block) {
              results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, diceAlly, diceEnemy, rollAlly, rollEnemy, -rollAlly, 0, AttackType.Stagger));
            } else if (diceAlly.type == DiceType.Block) {
              results.push(
                new CombatResult(
                  indexAlly,
                  indexEnemy,
                  allyData,
                  enemyData,
                  pageAlly,
                  pageEnemy,
                  diceAlly,
                  diceEnemy,
                  rollAlly,
                  rollEnemy,
                  0,
                  (rollEnemy - rollAlly) * enemyData.STdamageReceivedAdd,
                  AttackType.Stagger
                )
              );
            } else if (diceEnemy.type == DiceType.Block) {
              results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, diceAlly, diceEnemy, rollAlly, rollEnemy, 0, rollAlly - rollEnemy, AttackType.Mixed));
            } else {
              results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, diceAlly, diceEnemy, rollAlly, rollEnemy, 0, rollAlly, AttackType.Mixed));
            }
          } else if (rollAlly < rollEnemy) {
            if (diceEnemy.type == DiceType.Dodge && diceAlly.type != DiceType.Block && diceAlly.type != DiceType.Dodge) {
              results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, diceAlly, diceEnemy, rollAlly, rollEnemy, 0, -rollEnemy, AttackType.Stagger));
            } else if (diceEnemy.type == DiceType.Block) {
              results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, diceAlly, diceEnemy, rollAlly, rollEnemy, rollEnemy - rollAlly, 0, AttackType.Stagger));
            } else if (diceAlly.type == DiceType.Block) {
              results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, diceAlly, diceEnemy, rollAlly, rollEnemy, rollEnemy - rollAlly, 0, AttackType.Mixed));
            } else {
              results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, diceAlly, diceEnemy, rollAlly, rollEnemy, rollEnemy, 0, AttackType.Mixed));
            }
          }
          if (rollAlly == rollEnemy) {
            results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, diceAlly, diceEnemy, rollAlly, rollEnemy, 0, 0, AttackType.Mixed));
          }
        } else if (diceAlly) {
          if (diceAlly.type == DiceType.Dodge || diceAlly.type == DiceType.Block) {
          } else {
            results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, diceAlly, null, rollAlly, 0, 0, rollAlly, AttackType.Mixed));
          }
        } else if (diceEnemy) {
          if (diceEnemy.type == DiceType.Dodge || diceEnemy.type == DiceType.Block) {
          } else {
            results.push(new CombatResult(indexAlly, indexEnemy, allyData, enemyData, pageAlly, pageEnemy, null, diceEnemy, 0, rollEnemy, rollEnemy, 0, AttackType.Mixed));
          }
        }
        for (let status of this.allies[indexAlly].status) {
          if (isOnAfterRoll(status)) {
            this.handleEffect(status.onAfterDiceRoll(diceAlly), Side.Ally, indexAlly, indexEnemy, true, results);
          }
        }
        for (let status of this.enemies[indexEnemy].status) {
          if (isOnAfterRoll(status)) {
            this.handleEffect(status.onAfterDiceRoll(diceEnemy), Side.Enemy, indexEnemy, indexAlly, true, results);
          }
        }
        if (clashAlly && pageAlly) {
          if (isOnAfterRoll(pageAlly.pageEffect)) {
            this.handleEffect(pageAlly.pageEffect.onAfterDiceRoll(diceAlly), Side.Ally, indexAlly, indexEnemy, true, results);
          }
        }
        if (clashEnemy && pageEnemy) {
          if (isOnAfterRoll(pageEnemy.pageEffect)) {
            this.handleEffect(pageEnemy.pageEffect.onAfterDiceRoll(diceEnemy), Side.Enemy, indexEnemy, indexAlly, true, results);
          }
        }
      }
    }
    console.log(results);
  }
  /** A huge function to handle all effects from pages to statuses */
  handleEffect(effects: ResultMessage, side: Side, originIndex: number, targetIndex: number, incombat: boolean = false, combatresult: CombatResult[] | null = null): void {
    for (let effect of effects.results) {
      switch (effect.type) {
        case EffectType.Damage:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              if (!incombat) this.enemies[originIndex].doDamage(DiceType.Pure, AttackType.HP, effect.value);
              else combatresult!.push(CombatResult.directDamage(originIndex, targetIndex, effect.value, 0, AttackType.HP));
            }
            if (side == Side.Enemy) {
              if (!incombat) this.allies[originIndex].doDamage(DiceType.Pure, AttackType.HP, effect.value);
              else combatresult!.push(CombatResult.directDamage(targetIndex, originIndex, 0, effect.value, AttackType.HP));
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              if (!incombat) this.enemies[targetIndex].doDamage(DiceType.Pure, AttackType.HP, effect.value);
              else combatresult!.push(CombatResult.directDamage(originIndex, targetIndex, 0, effect.value, AttackType.HP));
            }
            if (side == Side.Enemy) {
              if (!incombat) this.allies[targetIndex].doDamage(DiceType.Pure, AttackType.HP, effect.value);
              else combatresult!.push(CombatResult.directDamage(targetIndex, originIndex, effect.value, 0, AttackType.HP));
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = effect.target.amount;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.doDamage(DiceType.Pure, AttackType.HP, effect.value)) limit--;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.doDamage(DiceType.Pure, AttackType.HP, effect.value)) limit--;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = effect.target.amount;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.doDamage(DiceType.Pure, AttackType.HP, effect.value)) limit--;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.doDamage(DiceType.Pure, AttackType.HP, effect.value)) limit--;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              if (character.doDamage(DiceType.Pure, AttackType.HP, effect.value)) limit--;
            }
          }
          break;
        case EffectType.StaggerDamage:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              if (!incombat) this.enemies[originIndex].doDamage(DiceType.Pure, AttackType.Stagger, effect.value);
              else combatresult!.push(CombatResult.directDamage(originIndex, targetIndex, effect.value, 0, AttackType.Stagger));
            }
            if (side == Side.Enemy) {
              if (!incombat) this.allies[originIndex].doDamage(DiceType.Pure, AttackType.Stagger, effect.value);
              else combatresult!.push(CombatResult.directDamage(targetIndex, originIndex, 0, effect.value, AttackType.Stagger));
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              if (!incombat) this.enemies[targetIndex].doDamage(DiceType.Pure, AttackType.Stagger, effect.value);
              else combatresult!.push(CombatResult.directDamage(originIndex, targetIndex, 0, effect.value, AttackType.Stagger));
            }
            if (side == Side.Enemy) {
              if (!incombat) this.allies[targetIndex].doDamage(DiceType.Pure, AttackType.Stagger, effect.value);
              else combatresult!.push(CombatResult.directDamage(targetIndex, originIndex, effect.value, 0, AttackType.Stagger));
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = effect.target.amount;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.doDamage(DiceType.Pure, AttackType.Stagger, effect.value)) limit--;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.doDamage(DiceType.Pure, AttackType.Stagger, effect.value)) limit--;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = effect.target.amount;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.doDamage(DiceType.Pure, AttackType.Stagger, effect.value)) limit--;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.doDamage(DiceType.Pure, AttackType.Stagger, effect.value)) limit--;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              if (character.doDamage(DiceType.Pure, AttackType.Stagger, effect.value)) limit--;
            }
          }
          break;
        case EffectType.InflictStatus:
          if (effect instanceof RollResultWithStatus) {
            if (effect.target.type == TargetType.SELF) {
              if (side == Side.Ally) {
                this.allies[originIndex].inflictStatus(effect.statusType);
              }
              if (side == Side.Enemy) {
                this.enemies[originIndex].inflictStatus(effect.statusType);
              }
            } else if (effect.target.type == TargetType.PAGE_TARGETS) {
              if (side == Side.Ally) {
                this.enemies[targetIndex].inflictStatus(effect.statusType);
              }
            } else if (effect.target.type == TargetType.ALLIES) {
              let limit = effect.target.amount;
              if (side == Side.Enemy) {
                for (let enemy of shallowShuffleCopy(this.enemies)) {
                  if (limit <= 0) break;
                  if (enemy.inflictStatus(effect.statusType)) limit--;
                }
              }
              if (side == Side.Ally) {
                for (let ally of shallowShuffleCopy(this.allies)) {
                  if (limit <= 0) break;
                  if (ally.inflictStatus(effect.statusType)) limit--;
                }
              }
            } else if (effect.target.type == TargetType.ENNEMIES) {
              let limit = effect.target.amount;
              if (side == Side.Ally) {
                for (let enemy of shallowShuffleCopy(this.enemies)) {
                  if (limit <= 0) break;
                  if (enemy.inflictStatus(effect.statusType)) limit--;
                }
              }
              if (side == Side.Enemy) {
                for (let ally of shallowShuffleCopy(this.allies)) {
                  if (limit <= 0) break;
                  if (ally.inflictStatus(effect.statusType)) limit--;
                }
              }
            } else if (effect.target.type == TargetType.ALL) {
              let limit = effect.target.amount;
              let characters = this.allies.concat(this.enemies);
              shuffleArray(characters);
              for (let character of characters) {
                if (limit <= 0) break;
                if (character.inflictStatus(effect.statusType)) limit--;
              }
            }
          }
          break;
        case EffectType.Stagger:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.enemies[originIndex].health.stagger();
            }
            if (side == Side.Enemy) {
              this.allies[originIndex].health.stagger();
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].health.stagger();
            }
            if (side == Side.Enemy) {
              this.allies[targetIndex].health.stagger();
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = effect.target.amount;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.health.staggered == false) {
                  ally.health.stagger();
                  limit--;
                }
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.health.staggered == false) {
                  enemy.health.stagger();
                  limit--;
                }
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = effect.target.amount;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.health.staggered == false) {
                  enemy.health.stagger();
                  limit--;
                }
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.health.staggered == false) {
                  ally.health.stagger();
                  limit--;
                }
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              if (character.health.staggered == false) {
                character.health.stagger();
                limit--;
              }
            }
          }
          break;
        case EffectType.IncreaseRollOffensive:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.atkPowerAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.atkPowerAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.atkPowerAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.atkPowerAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.atkPowerAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.atkPowerAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.atkPowerAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.atkPowerAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.atkPowerAdd += effect.value;
              limit--;
            }
          }
          break;
        case EffectType.IncreaseRollDefensive:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.defPowerAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.defPowerAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.defPowerAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.defPowerAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.defPowerAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.defPowerAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.defPowerAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.defPowerAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.defPowerAdd += effect.value;
              limit--;
            }
          }
          break;
        case EffectType.IncreaseSpeed:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.speedAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.speedAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.speedAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.speedAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.speedAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.speedAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.speedAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.speedAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.speedAdd += effect.value;
              limit--;
            }
          }
          break;
        case EffectType.NullifyPower:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.atkPowerMult = 0;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.atkPowerMult = 0;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.atkPowerMult = 0;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.atkPowerMult = 0;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.atkPowerMult = 0;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.atkPowerMult = 0;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.atkPowerMult = 0;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.atkPowerMult = 0;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.atkPowerMult = 0;
              limit--;
            }
          }
          break;
        case EffectType.IncreaseDamageReceived:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.damageReceivedAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.damageReceivedAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.damageReceivedAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.damageReceivedAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.damageAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.damageAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.damageAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.damageAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.damageReceivedAdd += effect.value;
              limit--;
            }
          }
          break;
        case EffectType.IncreaseSTDamageReceived:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.STdamageReceivedAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.STdamageReceivedAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.STdamageReceivedAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.STdamageReceivedAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.STdamageAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.STdamageAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.STdamageAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.STdamageAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.STdamageReceivedAdd += effect.value;
              limit--;
            }
          }
          break;
        case EffectType.AddDamageMult:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.damageReceivedMult += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.damageReceivedMult += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.damageReceivedMult += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.damageReceivedMult += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.damageMult += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.damageMult += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.damageMult += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.damageMult += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.damageReceivedMult += effect.value;
              limit--;
            }
          }
          break;
        case EffectType.Immobilize:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].immobilize();
            }
            if (side == Side.Enemy) {
              this.enemies[originIndex].immobilize();
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].immobilize();
            }
            if (side == Side.Enemy) {
              this.allies[targetIndex].immobilize();
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = effect.target.amount;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.immobilize()) limit--;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.immobilize()) limit--;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = effect.target.amount;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit <= 0) break;
                if (enemy.immobilize()) limit--;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit <= 0) break;
                if (ally.immobilize()) limit--;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              if (character.immobilize()) limit--;
            }
          }
          break;
        case EffectType.AddDamageDealtMult:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.damageDealtMult += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.damageDealtMult += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.damageDealtMult += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.damageDealtMult += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.damageDealtMult += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.damageDealtMult += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.damageDealtMult += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.damageDealtMult += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.damageDealtMult += effect.value;
              limit--;
            }
          }
          break;
        case EffectType.IncreaseDamageDealt:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.damageDealtAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.damageDealtAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.damageDealtAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.damageDealtAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.damageDealtAdd += effect.value;
                limit++;
              }
            } else if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.damageDealtAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.damageDealtAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.damageDealtAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.damageDealtAdd += effect.value;
              limit--;
            }
          }
          break;
        case EffectType.IncreaseSTDamageDealt:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.STdamageDealtAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.STdamageDealtAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.STdamageDealtAdd += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.STdamageDealtAdd += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.STdamageDealtAdd += effect.value;
                limit++;
              }
            } else if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.STdamageDealtAdd += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.STdamageDealtAdd += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.STdamageDealtAdd += effect.value;
                limit++;
              }
            }
          }
          break;
        case EffectType.AddSTDamageDealtMult:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.STdamageDealtMult += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.STdamageDealtMult += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.STdamageDealtMult += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.STdamageDealtMult += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.STdamageDealtMult += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.STdamageDealtMult += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.STdamageDealtMult += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.STdamageDealtMult += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.STdamageDealtMult += effect.value;
              limit--;
            }
          }
          break;
        case EffectType.AddSTDamageMult:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.allies[originIndex].turnstat.STdamageReceivedMult += effect.value;
            } else if (side == Side.Enemy) {
              this.enemies[originIndex].turnstat.STdamageReceivedMult += effect.value;
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].turnstat.STdamageReceivedMult += effect.value;
            } else if (side == Side.Enemy) {
              this.allies[targetIndex].turnstat.STdamageReceivedMult += effect.value;
            }
          } else if (effect.target.type == TargetType.ALLIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.STdamageReceivedMult += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.STdamageReceivedMult += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ENNEMIES) {
            let limit = 0;
            if (side == Side.Ally) {
              for (let enemy of shallowShuffleCopy(this.enemies)) {
                if (limit >= effect.target.amount) break;
                enemy.turnstat.STdamageReceivedMult += effect.value;
                limit++;
              }
            }
            if (side == Side.Enemy) {
              for (let ally of shallowShuffleCopy(this.allies)) {
                if (limit >= effect.target.amount) break;
                ally.turnstat.STdamageReceivedMult += effect.value;
                limit++;
              }
            }
          } else if (effect.target.type == TargetType.ALL) {
            let limit = effect.target.amount;
            let characters = this.allies.concat(this.enemies);
            shuffleArray(characters);
            for (let character of characters) {
              if (limit <= 0) break;
              character.turnstat.STdamageReceivedMult += effect.value;
              limit--;
            }
          }
          break;
        default: {
          console.error("Unhandled effect type in handleEffect:", effect.type);
        }
      }
    }
  }
}
