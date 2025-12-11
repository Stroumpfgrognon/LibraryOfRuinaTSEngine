export class spriteSheet {
    base: string;
    size: number;

    constructor(base: string, size: number) {
        this.base = base;
        this.size = size;
    }
}

export class characterSpriteSheet extends spriteSheet {
    run : string;
    attackSlash : string;
    attackPierce : string;
    attackBlunt : string;
    block : string;
    dodge : string;
    hurt : string;
    death : string;
    idleOffset: number[] = [0, 0];

    constructor(base: string, run: string, attackSlash: string, attackPierce: string, attackBlunt: string, block: string, dodge: string, hurt: string, death: string, size: number) {
        super(base, size);
        this.run = run;
        this.attackSlash = attackSlash;
        this.attackPierce = attackPierce;
        this.attackBlunt = attackBlunt;
        this.block = block;
        this.dodge = dodge;
        this.hurt = hurt;
        this.death = death;
    }

    setIdleOffset(x: number, y: number) {
        this.idleOffset = [x, y];
    }
}