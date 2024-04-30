
import amqp from "amqplib";
import { Server } from "socket.io";
import { createServer } from "http";

const queue = "notification";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

const receiveData = async () => {
    try {
        const connection = await amqp.connect("amqp://guest:guest@193.203.162.231:5672/");
        const channel = await connection.createChannel();

        await channel.consume(
            queue,
            (message) => {
                if (message) {
                    const randomNumber = Math.ceil(Math.random() * 100);
                    io.emit("SUBSCRIBE", message.content.toString() + " - " + randomNumber);
                    console.log(
                        " [x] Received '%s'",
                        message.content.toString() + " - " + randomNumber
                    );
                }
            },
            { noAck: true }
        );

        console.log(" [*] Waiting for messages. To exit press CTRL+C");
    } catch (err) {
        console.error(err)
    }
}

io.on('connection', socket => {
    console.log('DEBUG-SOCKET: ', socket.id);
    receiveData();
});

httpServer.listen(4000);