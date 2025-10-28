import { Character } from "#characters/characters";

export class Reception {
    allies : Character[];
    enemies : Character[];
    selectedCharacter : Character | null = null;
    selectedAlly : Character | null = null;
    selectedDiceNumber : number | null = 0;
    constructor(allies: Character[], enemies: Character[]){
        this.allies = allies;
        this.enemies = enemies;
    }
}