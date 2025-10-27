import dotenv from "dotenv";
import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { db, createMessagesTable } from "./utilities/createDB.js";

const PORT = process.env.PORT ?? 1234;

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000
    }
});

// Sólo ejecutar la primera vez o cuando se cree de nuevo la base de datos
// createMessagesTable();

app.use(express.static('client/public'));

io.on("connection", async(socket) => {
    console.log("Usuario conectado");

    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    });

    /**
     * En caso de que el usuario tenga una desconexión o simplemente
     * cierre y vuelva a abrir el chat un tiempo después, para obtener
     * los mensajes que previamente se ejecuta la consulta.
     * 
     * Por ejemplo si se recarga la página se produce una desconexión
     * y acto seguido una conexión, en ese caso se cumple la condición
     * y por lo tanto se obtienen los mensajes mediante la query.
     */
    if(!socket.recovered) {
        try {
            const results = await db.execute({
                sql: "SELECT id, content FROM messages WHERE id > ?",
                args: [socket.handshake.auth.serverOffset ?? 0]
            });

            results.rows.forEach(row => {
                socket.emit('new_message', row.content, row.id.toString());
            });
        } catch(e) {
            console.error(e.message);
            return;
        }
    }

    socket.on("new_message", async (msg) => {
        let result;
        
        try {
            result = await db.execute({
                sql: "INSERT INTO messages (content) VALUES (:content)",
                args: {content: msg}
            });
        } catch(e) {
            console.error(e.message);
            return;
        }

        io.emit("new_message", msg, result.lastInsertRowid.toString());
    });
});

app.use(logger("dev"));

//#region Rutas
app.get("/", (req, res) => {
   res.sendFile(process.cwd() + "/client/public/templates/index.html");
});

app.get("/login", (req, res) => {
    res.sendFile(process.cwd() + "/client/public/templates/login.html");
});

app.get("/register", (req, res) => {
    res.sendFile(process.cwd() + "/client/public/templates/register.html")
});

app.use((req, res) => {
    res.status(404).sendFile(
        process.cwd() + "/client/public/templates/404.html"
    );
});

server.listen(PORT, async() => {
    console.log(`Aplicación corriendo en el puerto ${PORT}`);
});
//#endregion
