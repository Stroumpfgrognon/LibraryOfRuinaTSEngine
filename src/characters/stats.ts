export class TurnStats {
  atkPowerAdd: number;
  atkPowerMult: number;
  defPowerAdd: number;
  defPowerMult: number;
  speedAdd: number;
  damageReceivedAdd: number;
  STdamageReceivedAdd: number;
  STdamageReceivedMult: number = 1;
  damageReceivedMult: number;
  damageDealtAdd: number = 0;
  damageDealtMult: number = 1;
  STdamageDealtAdd: number = 0;
  STdamageDealtMult: number = 1;

  constructor(
    atkPowerAdd: number = 0,
    atkPowerMult: number = 1,
    defPowerAdd: number = 0,
    defPowerMult: number = 1,
    speedAdd: number = 0,
    damageReceivedAdd: number = 0,
    STdamageReceivedAdd: number = 0,
    STdamageReceivedMult: number = 1,
    damageMult: number = 1,
    damageDealtAdd: number = 0,
    damageDealtMult: number = 1,
    STdamageDealtAdd: number = 0,
    STdamageDealtMult: number = 1
  ) {
    this.atkPowerAdd = atkPowerAdd;
    this.atkPowerMult = atkPowerMult;
    this.defPowerAdd = defPowerAdd;
    this.defPowerMult = defPowerMult;
    this.speedAdd = speedAdd;
    this.damageReceivedAdd = damageReceivedAdd;
    this.STdamageReceivedAdd = STdamageReceivedAdd;
    this.STdamageReceivedMult = STdamageReceivedMult;
    this.damageReceivedMult = damageMult;
    this.damageDealtAdd = damageDealtAdd;
    this.damageDealtMult = damageDealtMult;
    this.STdamageDealtAdd = STdamageDealtAdd;
    this.STdamageDealtMult = STdamageDealtMult;
  }

  grabStats(): TurnStats {
    let stats = new TurnStats(
      this.atkPowerAdd,
      this.atkPowerMult,
      this.defPowerAdd,
      this.defPowerMult,
      this.speedAdd,
      this.damageReceivedAdd,
      this.STdamageReceivedAdd,
      this.STdamageReceivedMult,
      this.damageReceivedMult,
      this.damageDealtAdd,
      this.damageDealtMult,
      this.STdamageDealtAdd,
      this.STdamageDealtMult
    );
    this.reset();
    return stats;
  }

  reset() {
    this.atkPowerAdd = 0;
    this.atkPowerMult = 1;
    this.defPowerAdd = 0;
    this.defPowerMult = 1;
    this.speedAdd = 0;
    this.damageReceivedAdd = 0;
    this.STdamageReceivedAdd = 0;
    this.STdamageReceivedMult = 1;
    this.damageReceivedMult = 1;
    this.damageDealtAdd = 0;
    this.damageDealtMult = 1;
    this.STdamageDealtAdd = 0;
    this.STdamageDealtMult = 1;
  }
}
