"use client";

import { useEffect, useRef, useState } from "react";
import initDraw from "../draw";

export default function Canvas({ shapes, roomID, socket, isLoading, setIsLoading, slug }: { shapes: any[], roomID: Number, socket: WebSocket, isLoading: boolean, setIsLoading: Function, slug: string }) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, shapes, roomID, socket, slug);
        }
    }, [canvasRef])

    return <div>
        <canvas style={{
            width: "100vw",
            height: "100vh",
            border: "1px solid red",
            overflow: "scroll",
        }}
            ref={canvasRef}></canvas>
    </div>;
}