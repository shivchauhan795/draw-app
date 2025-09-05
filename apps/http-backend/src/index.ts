import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./midleware";
import { CreateUserSchema, SignupSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());
app.post("/signup", async (req: Request, res: Response) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).send({
            message: parsedData.error.message || "invalid data"
        });
        return;
    }

    // check for the user if it exists in the db

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email
        }
    });
    if (user) {
        res.status(400).send({
            message: "user already exists"
        });
        return;
    }

    // encrypting password

    const encryptedPassword = await bcrypt.hash(parsedData.data.password, 8);

    // create the user
    try {
        const response = await prismaClient.user.create({
            data: {
                name: parsedData.data.name,
                email: parsedData.data.email,
                password: encryptedPassword
            }
        })
        if (!response) {
            res.status(500).send({
                message: "something went wrong"
            });
            return;
        }
        res.status(200).send({
            message: "user created successfully",
            userId: response.id
        });
    } catch (e) {
        res.status(500).send({
            message: "something went wrong"
        });
    }

})

app.post("/signin", async (req: Request, res: Response) => {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).send({
            message: parsedData.error.message || "invalid data"
        });
        return;
    }


    try {
        const user = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.email
            }
        })

        if (!user) {
            res.status(400).send({
                message: "invalid credentials"
            });
            return;
        }

        //verify the password

        const comparePassword = bcrypt.compare(parsedData.data.password, user?.password);

        if (!comparePassword) {
            res.status(400).send({
                message: "invalid credentials"
            });
            return;
        }

        const userId = user.id;
        const token = jwt.sign({
            userId
        }, JWT_SECRET);

        res.send({ token, userId });


    } catch (e) {
        res.status(500).send({
            message: "something went wrong"
        });
    }

})

app.post("/create-room", middleware, async (req: Request, res: Response) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).send({
            message: parsedData.error.message || "invalid data"
        });
        return;
    }

    try {

        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                // @ts-ignore
                adminId: req.userId
            }
        })

        if (!room) {
            res.status(411).send({
                message: "room with same name already exists"
            });
            return;
        }

        res.send({
            roomId: room.id
        })
    }
    catch (e) {
        res.status(500).send({
            message: "something went wrong"
        });
    }
})

app.get("/chats/:roomId", middleware, async (req: Request, res: Response) => {
    const roomId = parseInt(req.params.roomId ?? "");
    try {

        const messages = await prismaClient.room.findFirst({
            where: {
                id: roomId,
                members: {
                    some: {
                        // @ts-ignore
                        id: req.userId
                    }
                }

            },
            include: {
                chats: true
            }
        })
        res.send(messages);
    } catch (e) {
        res.status(500).send({
            message: "not a member of the room or room don't exists"
        });
    }
})

app.get("/room/:slug", middleware, async (req: Request, res: Response) => {
    const slug = req.params.slug?.toString() ?? "";
    try {
        const room = await prismaClient.room.findFirst({
            where: {
                slug: slug
            }
        })
        if (!room) {
            res.status(404).send({
                message: "room not found"
            });
            return;
        }
        res.send(room);
    } catch (e) {
        res.status(500).send({
            message: "something went wrong"
        });
    }
})


app.listen(3001, () => {
    console.log("http-backend listening on port 3001");
});