"use client";

import { useEffect, useRef, useState } from "react";
import initDraw from "../draw";
import Toolbar from "./ToolBar";

export default function Canvas({ roomID, socket, isLoading, setIsLoading, slug }: { roomID: Number, socket: WebSocket, isLoading: boolean, setIsLoading: Function, slug: string }) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const initRef = useRef(false);

    useEffect(() => {
        if (canvasRef.current && !initRef.current) {
            initRef.current = true;
            initDraw(canvasRef.current, roomID, socket, slug);
        }
    }, [])

    return <div className="relative">
        <canvas style={{
            width: "100vw",
            height: "100vh",
            border: "1px solid red",
            overflow: "scroll",
        }}
            ref={canvasRef}>
        </canvas>
        <Toolbar/>
    </div>;
}