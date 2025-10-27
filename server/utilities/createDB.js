import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();

export const db = createClient({
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN
});

export async function createMessagesTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT,
                dt DATETIME DEFAULT (datetime('now'))
            );
        `);

        console.log('TABLAS CREADAS CON ÉXITO');
    } catch(e) {
        console.error(e.message);
    }
}

export async function createUsersTable() {
    try {
        //TODO: Crear consulta para crear tabla usuarios
        // await db.execute()
    } catch(e) {
        console.error(e.message);
        return;
    }
}
