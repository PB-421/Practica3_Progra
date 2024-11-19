import { Libro,  ModelLibro } from "./Types.ts";

export function fromModeltoLibro(libroM:ModelLibro):Libro {
    return {
        idB: libroM._id!.toString(),
        titulo: libroM.title,
        autor: libroM.author,
        anyo: libroM.year
    }
}