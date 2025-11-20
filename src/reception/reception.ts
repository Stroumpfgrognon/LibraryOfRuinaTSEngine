import { Character } from "#characters/characters";
import { ClashAttack, Clash, ClashFull } from "./clash";
import { randomInt, shallowShuffleCopy, shuffleArray } from "#utils/random";
import { Page } from "#pages/pages";
import {
  isCombatStart,
  isEndOfScene,
  isOnAfterRoll,
  isOnClashLose,
  isOnClashWin,
  isOnDeath,
  isOnHit,
  isOnHitReceived,
  isOnPlay,
  isOnRoll,
  isOnUse,
} from "#utils/interfaces";
import { Side, AttackType, DiceType } from "#enums/attack";
import { ResultMessage } from "#results/resultlist";
import { TargetType } from "#results/targets";
import { EffectType } from "#enums/effect";
import { RollResultWithStatus } from "#results/results";
import { Effect } from "#pages/effects";
import { TriggersEnum } from "#enums/triggers";
import { DiceRoll } from "#pages/dice";

export class Reception {
  allies: Character[];
  enemies: Character[];
  selectedCharacter: Character | null = null;
  selectedAlly: Character | null = null;
  selectedDiceNumber: number | null = 0;
  /**  Used to cache clashes */
  clashToDate: boolean = false;
  clashes: Clash[] = []; // mainly for display
  clashPages: ClashFull[] = []; // for combat resolution
  // cutCombat: (Diceclash | CombatSecondaryEffect)[][][] = [];
  combatStep: number = -1;
  diceStep: number = 0;
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
    attacks.sort(
      (a, b) => b.speed + 0.5 * (b.side == Side.Enemy ? 1 : 0) - a.speed - 0.5 * (a.side == Side.Enemy ? 1 : 0)
    );
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
            clash.attackA.side == Side.Ally &&
            clash.attackA.attack.enemyIndex == attack.characterIndex &&
            clash.attackA.attack.enemyDiceIndex == attack.attack.diceIndex &&
            clash.attackB == null
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
    let clashPages: ClashFull[] = [];
    for (let clash of this.clashes) {
      let allyIndex: number;
      let enemyIndex: number;
      let allyPage: Page | null;
      let enemyPage: Page | null;
      if (clash.attackA.side == Side.Ally) {
        allyIndex = clash.attackA.characterIndex;
        allyPage = this.allies[allyIndex].hand[clash.attackA.attack.pageIndex];
        enemyIndex = clash.attackB ? clash.attackB.characterIndex : clash.attackA.attack.enemyIndex;
        enemyPage = clash.attackB ? this.enemies[enemyIndex].hand[clash.attackB.attack.pageIndex] : null;
      } else {
        enemyIndex = clash.attackA.characterIndex;
        enemyPage = this.enemies[enemyIndex].hand[clash.attackA.attack.pageIndex];
        allyIndex = clash.attackB ? clash.attackB.characterIndex : clash.attackA.attack.enemyIndex;
        allyPage = clash.attackB ? this.allies[allyIndex].hand[clash.attackB.attack.pageIndex] : null;
      }
      clashPages.push(new ClashFull(allyIndex, enemyIndex, allyPage, enemyPage));
    }
    let clashMass = clashPages.filter((c) => c.priority_level == 2);
    clashMass.sort((a, b) => {
      if (a.mass_side == Side.Ally && b.mass_side == Side.Enemy) return 1;
      if (a.mass_side == Side.Enemy && b.mass_side == Side.Ally) return -1;
      return b.mass_speed - a.mass_speed;
    });
    let clashRanged = clashPages.filter((c) => c.priority_level == 1);
    let clashMelee = clashPages.filter((c) => c.priority_level == 0);
    clashPages = clashMass.concat(clashRanged,clashMelee); // We prepare order for combat
    this.clashToDate = true;
    this.clashPages = clashPages;
    return clashes;
  }

  doCombatStep() {
    if (this.clashToDate == false) {
      this.resolveClashes();
      this.combatStep = 0;
      this.diceStep = 0;
      console.log(this.clashPages);
    }
    if (this.combatStep < 0) {
      this.combatStep = 0;
      this.diceStep = 0;
    }
    if (this.combatStep == 0 && this.diceStep == 0) {
      // Combat Start
      for (let clash of this.clashPages) {
        this.queryEffects(
          TriggersEnum.onCombatStart,
          clash.allyPage ? [clash.allyPage.pageEffect] : [],
          Side.Ally,
          clash.allyIndex,
          clash.enemyIndex
        );
        this.queryEffects(
          TriggersEnum.onCombatStart,
          clash.enemyPage ? [clash.enemyPage.pageEffect] : [],
          Side.Enemy,
          clash.enemyIndex,
          clash.allyIndex
        );
      }
      for (let ally of this.allies) {
        this.queryEffects(TriggersEnum.onCombatStart, ally.status, Side.Ally, this.allies.indexOf(ally), -1);
      }
      for (let enemy of this.enemies) {
        this.queryEffects(TriggersEnum.onCombatStart, enemy.status, Side.Enemy, this.enemies.indexOf(enemy), -1);
      }
    }
    let done = false;
    let resultAlly: number;
    let resultEnemy: number;
    while (!done) {
      if (this.combatStep >= this.clashPages.length) {
        console.log("Turn finished");
        return;
      }
      let clash = this.clashPages[this.combatStep];
      let allyPage: Page | null = clash.allyPage;
      if (allyPage && allyPage.broken) allyPage = null;
      let enemyPage: Page | null = clash.enemyPage;
      if (enemyPage && enemyPage.broken) enemyPage = null;
      let allyIndex = clash.allyIndex;
      let enemyIndex = clash.enemyIndex;
      if (this.diceStep === 0) {
        this.queryEffects(TriggersEnum.onUse, this.allies[allyIndex].status, Side.Ally, allyIndex, enemyIndex);
        this.queryEffects(TriggersEnum.onUse, this.enemies[enemyIndex].status, Side.Enemy, enemyIndex, allyIndex);
        if (allyPage)
          this.queryEffects(
            TriggersEnum.onUse,
            allyPage.pageEffect ? [allyPage.pageEffect] : [],
            Side.Ally,
            allyIndex,
            enemyIndex
          );
        if (enemyPage)
          this.queryEffects(
            TriggersEnum.onUse,
            enemyPage.pageEffect ? [enemyPage.pageEffect] : [],
            Side.Enemy,
            enemyIndex,
            allyIndex
          );
      }

      let ally = this.allies[allyIndex];
      let enemy = this.enemies[enemyIndex];
      let diceAlly,
        diceEnemy: DiceRoll | null = null;
      if (allyPage) {
        for (let i = this.diceStep; i < allyPage.rolls.length; i++) {
          if (!allyPage.rolls[i].used) {
            diceAlly = allyPage.rolls[i];
            diceAlly.used = true;
            break;
          }
        }
      }
      if (enemyPage) {
        for (let i = this.diceStep; i < enemyPage.rolls.length; i++) {
          if (!enemyPage.rolls[i].used) {
            diceEnemy = enemyPage.rolls[i];
            diceEnemy.used = true;
            break;
          }
        }
      }
      if (!diceAlly && !diceEnemy) {
        this.combatStep++;
        this.diceStep = 0;
        continue;
      }
      // First, before roll statuses
      if (diceAlly) this.queryEffects(TriggersEnum.onDiceRoll, ally.status, Side.Ally, allyIndex, enemyIndex, diceAlly);
      if (diceEnemy)
        this.queryEffects(TriggersEnum.onDiceRoll, enemy.status, Side.Enemy, enemyIndex, allyIndex, diceEnemy);
      // Then clash resolution
      let allyStats = ally.turnstat;
      let enemyStats = enemy.turnstat;
      resultAlly = randomInt(diceAlly ? diceAlly.rollMin : 0, diceAlly ? diceAlly.rollMax : 0);
      if (diceAlly) diceAlly.result = resultAlly;
      this.queryEffects(
        TriggersEnum.onAfterDiceRoll,
        diceAlly ? diceAlly.effects : [],
        Side.Ally,
        allyIndex,
        enemyIndex,
        diceAlly
      );
      this.queryEffects(TriggersEnum.onAfterDiceRoll, ally.status, Side.Ally, allyIndex, enemyIndex, diceAlly);
      if (diceAlly && (diceAlly.type == DiceType.Dodge || diceAlly.type == DiceType.Block))
        resultAlly += allyStats.defPowerAdd * allyStats.defPowerMult;
      else resultAlly += allyStats.atkPowerAdd * allyStats.atkPowerMult;
      resultEnemy = randomInt(diceEnemy ? diceEnemy.rollMin : 0, diceEnemy ? diceEnemy.rollMax : 0);
      if (diceEnemy) diceEnemy.result = resultEnemy;
      this.queryEffects(
        TriggersEnum.onAfterDiceRoll,
        diceEnemy ? diceEnemy.effects : [],
        Side.Enemy,
        enemyIndex,
        allyIndex,
        diceEnemy
      );
      this.queryEffects(TriggersEnum.onAfterDiceRoll, enemy.status, Side.Enemy, enemyIndex, allyIndex, diceEnemy);
      if (diceEnemy && (diceEnemy.type == DiceType.Dodge || diceEnemy.type == DiceType.Block))
        resultEnemy += enemyStats.defPowerAdd * enemyStats.defPowerMult;
      else resultEnemy += enemyStats.atkPowerAdd * enemyStats.atkPowerMult;
      let winner,
        looser,
        resultWinner,
        resultLooser,
        diceWinner,
        diceLooser,
        winnerIndex,
        looserIndex,
        winnerSide,
        looserSide,
        looserStat;
      if (resultAlly > resultEnemy || (diceAlly && !diceEnemy)) {
        winner = ally;
        looser = enemy;
        resultWinner = resultAlly;
        resultLooser = resultEnemy;
        diceWinner = diceAlly;
        diceLooser = diceEnemy;
        winnerIndex = allyIndex;
        looserIndex = enemyIndex;
        winnerSide = Side.Ally;
        looserSide = Side.Enemy;
        looserStat = enemyStats;
      } else if (resultEnemy > resultAlly || (diceEnemy && !diceAlly)) {
        winner = enemy;
        looser = ally;
        resultWinner = resultEnemy;
        resultLooser = resultAlly;
        diceWinner = diceEnemy;
        diceLooser = diceAlly;
        winnerIndex = enemyIndex;
        looserIndex = allyIndex;
        winnerSide = Side.Enemy;
        looserSide = Side.Ally;
        looserStat = allyStats;
      } else {
        winnerSide = Side.NA;
      }
      if (diceAlly && diceEnemy && winner) {
        // Clash with both dices played
        this.queryEffects(TriggersEnum.onClashWin, diceWinner!.effects, winnerSide!, winnerIndex!, looserIndex!);
        this.queryEffects(TriggersEnum.onClashWin, winner!.status, winnerSide!, winnerIndex!, looserIndex!);
        this.queryEffects(TriggersEnum.onClashLose, diceLooser!.effects, looserSide!, looserIndex!, winnerIndex!);
        this.queryEffects(TriggersEnum.onClashLose, looser!.status, looserSide!, looserIndex!, winnerIndex!);

        if (
          diceWinner!.type == DiceType.Dodge &&
          diceLooser!.type != DiceType.Dodge &&
          diceLooser!.type != DiceType.Block
        ) {
          winner!.doDamage(DiceType.Dodge, AttackType.Stagger, -resultWinner!, looserStat);
        } else if (diceWinner!.type == DiceType.Block) {
          looser!.doDamage(DiceType.Block, AttackType.Stagger, resultWinner! - resultLooser!, looserStat);
        } else if (diceWinner!.type != DiceType.Dodge) {
          looser!.doDamage(
            DiceType.Pure,
            AttackType.Mixed,
            diceLooser!.type == DiceType.Block ? resultWinner! - resultLooser! : resultWinner!,
            looserStat
          );
          this.queryEffects(TriggersEnum.onHit, diceWinner!.effects, winnerSide!, winnerIndex!, looserIndex!);
          this.queryEffects(TriggersEnum.onHit, winner!.status, winnerSide!, winnerIndex!, looserIndex!);
        }
      } else if (!diceLooser && diceWinner) {
        // Unilateral hit with one dice played
        if (diceWinner.type != DiceType.Dodge && diceWinner.type != DiceType.Block) {
          looser!.doDamage(diceWinner.type, AttackType.Mixed, resultWinner!, looserStat);
          this.queryEffects(TriggersEnum.onHit, diceWinner.effects, winnerSide!, winnerIndex!, looserIndex!);
          this.queryEffects(TriggersEnum.onHit, winner!.status, winnerSide!, winnerIndex!, looserIndex!);
          this.queryEffects(TriggersEnum.onHitReceived, looser!.status, looserSide!, looserIndex!, winnerIndex!);
        } else {
          console.log("Unilateral defense, recycling dice (todo)");
          // IMPLEMENTING DICE RECYCLING TODO
        }
      } else {
        console.log("Tie or no dices");
        // No dices or tie, do nothing
      }
      console.log("Results: ", resultAlly, " vs ", resultEnemy);
      ally.turnstat.reset();
      enemy.turnstat.reset();
      done = true;
      this.diceStep++;
    }
  }

  queryEffects(
    trigger: TriggersEnum,
    list: Effect[],
    side: Side,
    originIndex: number,
    targetIndex: number,
    ...arg: any[]
  ): void {
    for (let effect of list)
      switch (trigger) {
        case TriggersEnum.onUse:
          if (isOnUse(effect)) this.handleEffect(effect.onUse(arg[0], arg[1]), side, originIndex, targetIndex);
          break;
        case TriggersEnum.onDiceRoll:
          if (isOnRoll(effect)) this.handleEffect(effect.onDiceRoll(arg[0]), side, originIndex, targetIndex);
          break;
        case TriggersEnum.onAfterDiceRoll:
          if (isOnAfterRoll(effect)) this.handleEffect(effect.onAfterDiceRoll(arg[0]), side, originIndex, targetIndex);
          break;
        case TriggersEnum.onClashWin:
          if (isOnClashWin(effect)) this.handleEffect(effect.onClashWin(), side, originIndex, targetIndex);
          break;
        case TriggersEnum.onClashLose:
          if (isOnClashLose(effect)) this.handleEffect(effect.onClashLose(), side, originIndex, targetIndex);
          break;
        case TriggersEnum.endOfScene:
          if (isEndOfScene(effect)) this.handleEffect(effect.endOfScene(), side, originIndex, targetIndex);
          break;
        case TriggersEnum.onCombatStart:
          if (isCombatStart(effect)) this.handleEffect(effect.onCombatStart(), side, originIndex, targetIndex);
          break;
        case TriggersEnum.onDeath:
          if (isOnDeath(effect)) this.handleEffect(effect.onDeath(), side, originIndex, targetIndex);
          break;
        case TriggersEnum.onHit:
          if (isOnHit(effect)) this.handleEffect(effect.onHit(), side, originIndex, targetIndex);
          break;
        case TriggersEnum.onHitReceived:
          if (isOnHitReceived(effect)) this.handleEffect(effect.onHitReceived(), side, originIndex, targetIndex);
          break;
        case TriggersEnum.onPlay:
          if (isOnPlay(effect)) this.handleEffect(effect.onPlay(), side, originIndex, targetIndex);
          break;
        default:
          break;
      }
  }

  /** A huge function to handle all effects from pages to statuses */
  handleEffect(effects: ResultMessage, side: Side, originIndex: number, targetIndex: number): void {
    for (let effect of effects.results) {
      switch (effect.type) {
        case EffectType.Damage:
          if (effect.target.type == TargetType.SELF) {
            if (side == Side.Ally) {
              this.enemies[originIndex].doDamage(DiceType.Pure, AttackType.HP, effect.value);
            }
            if (side == Side.Enemy) {
              this.allies[originIndex].doDamage(DiceType.Pure, AttackType.HP, effect.value);
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].doDamage(DiceType.Pure, AttackType.HP, effect.value);
            }
            if (side == Side.Enemy) {
              this.allies[targetIndex].doDamage(DiceType.Pure, AttackType.HP, effect.value);
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
              this.enemies[originIndex].doDamage(DiceType.Pure, AttackType.Stagger, effect.value);
            }
            if (side == Side.Enemy) {
              this.allies[originIndex].doDamage(DiceType.Pure, AttackType.Stagger, effect.value);
            }
          } else if (effect.target.type == TargetType.PAGE_TARGETS) {
            if (side == Side.Ally) {
              this.enemies[targetIndex].doDamage(DiceType.Pure, AttackType.Stagger, effect.value);
            }
            if (side == Side.Enemy) {
              this.allies[targetIndex].doDamage(DiceType.Pure, AttackType.Stagger, effect.value);
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
              } else if (side == Side.Enemy) {
                this.allies[targetIndex].inflictStatus(effect.statusType);
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
