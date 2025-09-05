import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 3002 });

interface User {
    userId: string;
    rooms: string[];
    socketId: WebSocket;
}

const users: User[] = [];

function checkUser(token: string): string | null {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
        return null;
    }

    if (!decoded || !decoded.userId) {

        return null;
    }
    return decoded.userId;
}

wss.on("connection", (ws: WebSocket, req) => {
    const url = req.url;
    if (!url) {
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") ?? "";

    const userId = checkUser(token);
    if (userId == null) {
        ws.close();
        return null;
    }


    users.push({
        userId,
        rooms: [],
        socketId: ws
    })


    ws.on("message", async (message) => {
        try {
            JSON.parse(message.toString());

            const parsedMessage = JSON.parse(message.toString());

            if (parsedMessage.type === "create_room") {

                try {
                    const room = await prismaClient.room.create({
                        data: {
                            slug: parsedMessage.roomId,
                            adminId: userId,
                            members: {
                                connect: {
                                    id: userId
                                }
                            }
                        }
                    })
                    const roomId = parsedMessage.roomId;
                    const user = users.find((user) => user.socketId === ws);
                    if (user) {
                        user.rooms.push(roomId);
                    }

                    ws.send(JSON.stringify({
                        type: "create_room_confirm",
                        message: "created room: " + roomId
                    }))
                } catch (e) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: e
                    }))
                    return;
                }
            }

            if (parsedMessage.type === "join_room") {

                try {

                    const room = await prismaClient.room.findFirst({
                        where: {
                            slug: parsedMessage.roomId
                        }
                    })

                    if (!room) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "room not found"
                        }))
                        return;
                    }

                    const joinedRoom = await prismaClient.room.update({
                        where: {
                            slug: parsedMessage.roomId
                        },
                        data: {
                            members: {
                                connect: {
                                    id: userId
                                }
                            }
                        }
                    })
                    if (!joinedRoom) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "room not joined"
                        }))
                        return;
                    }

                    const roomId = parsedMessage.roomId;
                    const user = users.find((user) => user.socketId === ws);
                    if (user) {
                        user.rooms.push(roomId);
                    }

                    ws.send(JSON.stringify({
                        type: "join_room_confirm",
                        message: "joined room: " + roomId
                    }))

                } catch (e) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "room not joined"
                    }))
                    return;
                }
            }

            if (parsedMessage.type === "leave_room") {

                try {

                    const room = await prismaClient.room.findFirst({
                        where: {
                            slug: parsedMessage.roomId
                        }
                    })

                    if (!room) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "room not found"
                        }))
                        return;
                    }

                    const removed = await prismaClient.room.update({
                        where: {
                            slug: parsedMessage.roomId
                        },
                        data: {
                            members: {
                                disconnect: {
                                    id: userId
                                }
                            }
                        }
                    })
                    const roomId = parsedMessage.roomId;
                    const user = users.find((user) => user.socketId === ws);
                    if (user) {
                        user.rooms = user.rooms.filter((room) => room !== roomId);
                    }

                    ws.send(JSON.stringify({
                        type: "leave_room_confirm",
                        message: "left room: " + roomId
                    }))

                } catch (e) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "room not left"
                    }))
                    return;
                }

            }

            if (parsedMessage.type === "delete_room") {
                if (!parsedMessage.roomId) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "roomId is required"
                    }))
                }

                try {
                    const room = await prismaClient.room.findFirst({
                        where: {
                            slug: parsedMessage.roomId,
                            adminId: userId
                        }
                    })

                    if (!room) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "room not found or you are not the admin"
                        }))
                        return;
                    }

                    await prismaClient.chat.deleteMany({
                        where: {
                            roomId: room.id
                        }
                    });

                    const deletedRoom = await prismaClient.room.delete({
                        where: {
                            slug: parsedMessage.roomId
                        },
                        include: {
                            members: true,
                        }
                    })
                    if (!deletedRoom) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "room not deleted"
                        }))
                    }

                    ws.send(JSON.stringify({
                        type: "delete_room_confirm",
                        message: "deleted room: " + parsedMessage.roomId
                    }))

                } catch (e) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: e
                    }))
                    return;
                }
            }


            if (parsedMessage.type === "chat") {

                if (!parsedMessage.message) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "message is required"
                    }))
                    return;
                }

                try {

                    const room = await prismaClient.room.findFirst({
                        where: {
                            slug: parsedMessage.roomId,
                            members: {
                                some: {
                                    id: userId
                                }
                            }
                        }
                    });

                    if (!room) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "room not found"
                        }))
                        return;
                    }

                    console.log(parsedMessage.message, userId, room.id);
                    const chatAdded = await prismaClient.chat.create({
                        data: {
                            message: parsedMessage.message,
                            userId: userId,
                            roomId: room.id
                        }
                    })
                    if (!chatAdded) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "message not sent"
                        }))
                        return;
                    }

                    const roomId = parsedMessage.roomId;
                    const message = parsedMessage.message;

                    // check if the user is part of the room or not??
                    const user = users.find((user) => user.socketId === ws);
                    if (!user) return;

                    if (user.rooms.includes(roomId) === false) return;


                    // send the message to the room

                    users.forEach((user) => {
                        if (user.rooms.includes(roomId) ) { //add this if you don't want to send to yourself -->  && user.socketId !== ws
                            user.socketId.send(JSON.stringify({
                                type: "chat",
                                roomId,
                                message,
                                userId,
                                id: chatAdded.id
                            }))
                        }
                    })

                } catch (e) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: e
                    }))
                    return;
                }




            }
        } catch (error) {
            console.log(error);
        }

    });
});