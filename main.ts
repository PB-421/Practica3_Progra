import { MongoClient, ObjectId } from "mongodb";
import { ModelLibro } from "./Types.ts";
import {fromModeltoLibro} from "./Utils.ts"

const url = Deno.env.get("MONGO_URL")

if(!url){
  console.error("Se necesita un .env con el enlace al cluster de Mongodb")
  Deno.exit(-1)
}

const client = new MongoClient(url);

  await client.connect();
  console.log('Conexion exitosa');
  const db = client.db("Practica3");
  const collectionLibros = db.collection<ModelLibro>('libros');

  async function handler(req:Request):Promise<Response> {
    const metodo = req.method
    const url = new URL(req.url)
    const path = url.pathname

    if (metodo === "GET") {
      if(path.startsWith("/books/")){
        const ruta = path.split('/')
        const id = ruta[ruta.length-1].replaceAll("%20", " ")
        console.log(id)
       if(!id){
        return new Response("id not detected",{status:404})
       }
       if(id.length !== 24){
        return new Response("id invalid",{status:404})
       }
          const bookdb=await collectionLibros.find({_id:new ObjectId(id)}).toArray()
          if(bookdb.length===0){
            return new Response("Book not found",{status:404})
          }
          const books=(await bookdb).map((b)=>fromModeltoLibro(b))
          return new Response(JSON.stringify(books))

      } else if(path === "/books"){
        const bookdb=await collectionLibros.find().toArray()
        const books=(await bookdb).map((b)=>fromModeltoLibro(b))
        return new Response(JSON.stringify(books))
      }
    return new Response("enpoint not found")
  } else if(metodo === "POST"){
      if(path === "/books"){
          if(!req.body) return new Response("Bad request",{status:400})
          const payload = await req.json()
          if(!payload.title){
            return new Response("Falta el titulo",{status:400})
          } else if(!payload.author){
            return new Response("Falta el autor",{status:400})
          } else if(!payload.year){
            return new Response("Falta el año de publicacion",{status:400})
          }

          const {insertedId} = await collectionLibros.insertOne({
            title: payload.title,
            author: payload.author,
            year: payload.year
          })

          return new Response(JSON.stringify({
            Message: "Libro insertado correctamente",
            id: insertedId,
            Titulo: payload.title,
            Autor: payload.author,
            Año_publicacion: payload.year
          }),{status:201})
          
      }
      return new Response("Path not found",{status:404})
  } else if (metodo === "PUT"){
    if(path.startsWith("/books/")){
      const ruta = path.split('/')
      const id = ruta[ruta.length-1].replaceAll("%20", " ")
      if(!id){
        return new Response("ID not detected",{status:404})
      }
      if(id.length !== 24){
        return new Response("ID not valid",{status:404})
      }
      if(!req.body) return new Response("Bad request",{status:400})
        const payload = await req.json()
          
        const libros:ModelLibro[] = await collectionLibros.find({_id: new ObjectId(id)}).toArray()

        if(libros.length === 0){
          return new Response("Book not found",{status:400})
        }


        if(!payload.title && !payload.author && !payload.year){
          return new Response("Debe enviar al menos un campo para actualizar (title, author, year)",{status:404})
        }else if(payload.title && payload.author && payload.year){
           await collectionLibros.updateOne(
            {_id: new ObjectId(id)},
            {$set:{title: payload.title,author: payload.author,year: payload.year}})
        } else if(payload.title && payload.author){
           await collectionLibros.updateOne(
            {_id: new ObjectId(id)},
            {$set:{title: payload.title,author: payload.author}})
        } else if(payload.title && payload.year){
           await collectionLibros.updateOne(
            {_id: new ObjectId(id)},
            {$set:{title: payload.title,year: payload.year}})
        } else if (payload.title){
           await collectionLibros.updateOne(
            {_id: new ObjectId(id)},
            {$set:{title: payload.title}})
        } else if (payload.author && payload.year){
           await collectionLibros.updateOne(
            {_id: new ObjectId(id)},
            {$set:{author: payload.author,year: payload.year}})
        } else if (payload.author){
           await collectionLibros.updateOne(
            {_id: new ObjectId(id)},
            {$set:{author: payload.author}})
        } else if (payload.year){
           await collectionLibros.updateOne(
            {_id: new ObjectId(id)},
            {$set:{year: payload.year}})
          }

          return new Response(JSON.stringify({Message: "Libro actualizado correctamente",
            id: new ObjectId(id),
            Titulo: payload.title,
            Autor: payload.author,
            Año_de_publicacion: payload.year}))
        }
        return new Response("Path not found",{status:404})
    } else if(metodo === "DELETE"){
      if(path.startsWith("/books/")){
        const ruta = path.split('/')
        const id = ruta[ruta.length-1].replaceAll("%20", " ")
        if(!id){
          return new Response("id not detected",{status:404})
         }
         if(id.length !== 24){
          return new Response("id invalid",{status:404})
         }
  
          const { deletedCount } = await collectionLibros.deleteOne({
            _id: new ObjectId(id),
          });
  
          if (deletedCount === 0) {
            return new Response("book not found", { status: 404 });
          }
          return new Response("Libro eliminado correctamente", { status: 200 });
      }
    }
    return new Response("Method not found",{status:404})
  }

Deno.serve({port:1234},handler)