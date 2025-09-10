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

export default async function initDraw(canvas: HTMLCanvasElement, roomID: Number, socket: WebSocket, slug: string, toolRef: React.RefObject<string>, panRef: React.RefObject<{ panX: number, panY: number, scale: number, updateCanvas: Function }>) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let scale = 1;  // initial zoom level

    let panX = 0;
    let panY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isPanning = false;

    socket.onmessage = (e) => {
        const message = JSON.parse(e.data);

        if (message.type === "chat") {
            const parsedMessage = JSON.parse(message.message);
            exsistingDrawings.push(parsedMessage);
            clearCanvas(ctx, exsistingDrawings, canvas, toolRef, panX, panY, scale);
            console.log(toolRef.current);
        }
    }

    const exsistingDrawings = await getExistingShapes(roomID) || [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    clearCanvas(ctx, exsistingDrawings, canvas, toolRef, panX, panY, scale);

    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        const { x, y } = screenToCanvas(e.clientX, e.clientY, canvas, panX, panY, scale);
        startX = x;
        startY = y;
        if (toolRef.current === "Pan") {
            isPanning = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        isPanning = false;
        const { x: endX, y: endY } = screenToCanvas(e.clientX, e.clientY, canvas, panX, panY, scale);

        if (toolRef.current === 'Rectangle') {
            const shape: Shapes = {
                type: "rect",
                x: startX,
                y: startY,
                width: endX - startX,
                height: endY - startY
            }

            if (shape.width == 0 && shape.height == 0) return;
            exsistingDrawings.push(shape);

            socket.send(
                JSON.stringify({
                    type: "chat",
                    message: JSON.stringify(shape),
                    roomId: slug
                })
            );
        } else if (toolRef.current === 'Circle') {
            const shape: Shapes = {
                type: "circle",
                x: startX,
                y: startY,
                radius: Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
            }
            if (shape.radius == 0) return;
            exsistingDrawings.push(shape);
            socket.send(
                JSON.stringify({
                    type: "chat",
                    message: JSON.stringify(shape),
                    roomId: slug
                })
            );
        }
    });

    canvas.addEventListener("mousemove", (e) => {

        if (clicked && toolRef.current === "Rectangle") {
            const { x: currentX, y: currentY } = screenToCanvas(e.clientX, e.clientY, canvas, panX, panY, scale);
            const width = currentX - startX;
            const height = currentY - startY;
            clearCanvas(ctx, exsistingDrawings, canvas, toolRef, panX, panY, scale);
            ctx.save();
            ctx.translate(panX, panY);
            ctx.scale(scale, scale);
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.strokeRect(startX, startY, width, height);
            ctx.restore();
        } else if (clicked && toolRef.current === "Circle") {
            const { x: currentX, y: currentY } = screenToCanvas(e.clientX, e.clientY, canvas, panX, panY, scale);
            const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
            clearCanvas(ctx, exsistingDrawings, canvas, toolRef, panX, panY, scale);
            ctx.save();
            ctx.translate(panX, panY);
            ctx.scale(scale, scale);
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
        }
        if (clicked && toolRef.current === 'Pan') {
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;

            panX += dx;
            panY += dy;

            panRef.current.panX = panX;
            panRef.current.panY = panY;
            panRef.current.scale = scale;

            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            clearCanvas(ctx, exsistingDrawings, canvas, toolRef, panX, panY, scale);
        }
    });

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();

        const zoomIntensity = 0.1;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;

        // Calculate zoom direction
        const zoom = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;

        // Adjust pan to zoom at the mouse position
        panX = x - ((x - panX) * zoom);
        panY = y - ((y - panY) * zoom);


        scale *= zoom;
        scale = Math.max(0.1, Math.min(scale, 7)); // clamp between 0.1x and 10x
        panRef.current.panX = panX;
        panRef.current.panY = panY;
        panRef.current.scale = scale;
        clearCanvas(ctx, exsistingDrawings, canvas, toolRef, panX, panY, scale);
    })

    panRef.current = {
        panX, panY, scale, updateCanvas: () => {
            clearCanvas(ctx, exsistingDrawings, canvas, toolRef, panX, panY, scale);
        }
    };

}

function screenToCanvas(
    clientX: number,
    clientY: number,
    canvas: HTMLCanvasElement,
    panX: number,
    panY: number,
    scale: number
) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - panX) / scale;
    const y = (clientY - rect.top - panY) / scale;
    return { x, y };
}


function clearCanvas(ctx: CanvasRenderingContext2D, existingDrawings: Shapes[], canvas: HTMLCanvasElement, toolRef: React.RefObject<string>, panX: number, panY: number, scale: number) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(18, 18, 18)";
    ctx.fillRect(-panX / scale, -panY / scale, canvas.width / scale, canvas.height / scale);
    if (existingDrawings.length > 0) {
        existingDrawings.forEach((shape) => {
            if (shape.type === "rect") {
                ctx.strokeStyle = "rgba(255,255,255";
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }else if(shape.type === "circle") {
                ctx.strokeStyle = "rgba(255,255,255)";
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });
    }
    ctx.restore();


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