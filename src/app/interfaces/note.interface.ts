export interface Note {
    id?: string;
    type: "note" | "trash";
    title:string;
    description:string;
    marked: boolean;
}
