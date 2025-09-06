import axios from "axios";
import { BACKEND_URL, getToken } from "../../utils";

type Shapes = {
    type: "rect",
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle",
    x: number;
    y: number;
    radius: number;
}

export default async function initDraw(canvas: HTMLCanvasElement, roomID: Number, socket: WebSocket, slug: string) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    socket.onmessage = (e) => {
        const message = JSON.parse(e.data);

        if (message.type === "chat") {
            const parsedMessage = JSON.parse(message.message);
            exsistingDrawings.push(parsedMessage);
            clearCanvas(ctx, exsistingDrawings, canvas);
        }
    }

    const exsistingDrawings = await getExistingShapes(roomID) || [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    clearCanvas(ctx, exsistingDrawings, canvas);

    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const shape: Shapes = {
            type: "rect",
            x: startX,
            y: startY,
            width: e.clientX - startX,
            height: e.clientY - startY
        }
        exsistingDrawings.push(shape);

        socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify(shape),
                roomId: slug
            })
        );
    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(ctx, exsistingDrawings, canvas);
            ctx.strokeStyle = "rgba(255,255,255";
            ctx.strokeRect(startX, startY, width, height);
        }
    });

}


function clearCanvas(ctx: CanvasRenderingContext2D, existingDrawings: Shapes[], canvas: HTMLCanvasElement) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(18, 18, 18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (existingDrawings.length > 0) {
        existingDrawings.forEach((shape) => {
            if (shape.type === "rect") {
                ctx.strokeStyle = "rgba(255,255,255";
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
        });
    }

}

async function getExistingShapes(roomID: Number) {
    const token = getToken();
    try {
        const response = await axios.get(`${BACKEND_URL}/chats/${roomID}`, {
            headers: {
                Authorization: `${token}`
            }
        })
        const messages = response.data.chats;

        const shapes = messages.map((x: any) => {
            const parsedMessage = JSON.parse(x.message);
            return parsedMessage
        });
        return shapes;
    } catch (e) {
        console.log(e);
    }
}