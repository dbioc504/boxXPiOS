import { Id, Style } from "./common";

export interface Profile {
    id: Id;
    displayName?: string;
    style: Style;
    createdAt: string;
}