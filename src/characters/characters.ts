import {StatusEffect} from "../@types/status";
import {DMGType} from "../enums/attack";

export class Character {
    name: string;
    health: number;
    stagger: number;
    status: Array<StatusEffect>;

    constructor(name: string, health: number, stagger: number) {
        this.name = name;
        this.health = health;
        this.stagger = stagger;
        this.status = [];
    }

    

}