import { EmotionType } from "#enums/emotion";

export class EmotionLevelUp {
  levelChanged: boolean;
  balance: number;
  constructor(levelChanged: boolean, balance: number) {
    this.levelChanged = levelChanged;
    this.balance = balance;
  }
}

class EmotionPoint {
  type: EmotionType;
  constructor(type: EmotionType) {
    this.type = type;
  }
}

export class EmotionEngine {
  emotionLevel: number;
  emotionPoints: EmotionPoint[];
  constructor(emotionLevel?: number) {
    this.emotionLevel = emotionLevel || 0;
    this.emotionPoints = [];
  }

  addEmotionPoint(type: EmotionType) {
    const point = new EmotionPoint(type);
    this.emotionPoints.push(point);
  }

  updateEmotionLevel(): EmotionLevelUp {
    return new EmotionLevelUp(false, -1);
  }

  getLimit(): number {
    return (Math.max(this.emotionLevel, 1) - 1) * 2 + 3;
  }

  startOfScene(): void {
    this.updateEmotionLevel();
  }
}

export class HumanEmotionEngine extends EmotionEngine {
  constructor() {
    super();
  }

  override updateEmotionLevel(): EmotionLevelUp {
    let limit = this.getLimit();
    if (this.emotionPoints.length >= limit) {
      let balance = 0;
      for (let i = 0; i < limit; i++) {
        const point = this.emotionPoints[i];
        if (point.type === EmotionType.Positive) {
          balance += 1;
        }
      }
      balance /= limit;
      this.emotionLevel += 1;
      this.emotionPoints.length = 0;
      return new EmotionLevelUp(true, balance);
    }
    return new EmotionLevelUp(false, -1);
  }
}

export class AbnormalityEmotionEngine extends EmotionEngine {
  constructor() {
    super(0);
  }

  override addEmotionPoint(): void {
    return;
  }
}
