import { Id, Category, Movement } from "./common";

export interface Combo {
    id: Id;
    name?: string;
    category?: Category;
    steps: Movement[];
}