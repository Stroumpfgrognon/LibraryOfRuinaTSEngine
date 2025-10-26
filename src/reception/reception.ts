import { Character } from "../characters/characters";

export class Reception {
    allies : Character[];
    enemies : Character[];
    constructor(allies: Character[], enemies: Character[]){
        this.allies = allies;
        this.enemies = enemies;
    }
}