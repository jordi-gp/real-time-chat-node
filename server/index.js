import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";

const PORT = process.env.PORT ?? 1234;

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
   console.log('Usuario conectado');

   console.log(socket);

   socket.on('disconnect', () => {
      console.log('Usuario desconectado');
   });
});

app.use(logger('dev'));

app.get('/', (req, res) => {
   res.sendFile(process.cwd() + '/client/index.html');
});

server.listen(PORT, () => {
   console.log(`Aplicación corriendo en el puerto ${PORT}`);
});