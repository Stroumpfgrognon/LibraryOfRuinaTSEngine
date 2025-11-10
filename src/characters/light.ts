export class LightEngine {
    lightPoints: number;
    maxLightPoints: number;
    emotionLightUpAmounts : number[];
    emotionLevel: number = 0;

    constructor(maxLightPoints: number, emotionLightUpAmounts : number[] = [1, 1, 1, 1, 1]) {
        this.maxLightPoints = maxLightPoints;
        this.lightPoints = maxLightPoints;
        this.emotionLightUpAmounts = emotionLightUpAmounts;
    }

    addLight(points: number) {
        this.lightPoints = Math.min(this.lightPoints + points, this.maxLightPoints);
    }

    consumeLight(cost: number): boolean {
        if (this.lightPoints >= cost) {
            this.lightPoints -= cost;
            return true;
        }
        return false;
    }

    emotionLightUp(amount : number) : void {
        this.maxLightPoints += amount;
        this.lightPoints = this.maxLightPoints;
    }

    emotionLevelIncreased() : void {
        if(this.emotionLevel >= this.emotionLightUpAmounts.length) return;
        this.emotionLightUp(this.emotionLightUpAmounts[this.emotionLevel]);
        this.emotionLevel += 1;
    }
}