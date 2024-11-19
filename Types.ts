import type {ObjectId} from "mongodb"


export type ModelLibro = {
    _id?: ObjectId
    title: string
    author: string
    year: number
}

export type Libro = {
    idB: string
    titulo: string
    autor: string
    anyo: number
}