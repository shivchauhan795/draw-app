"use client";

import { useEffect, useRef, useState } from "react";
import initDraw from "../draw";
import Toolbar from "./ToolBar";
import { stateContext } from "../utils/context/stateContext";

export default function Canvas({ roomID, socket, isLoading, setIsLoading, slug }: { roomID: Number, socket: WebSocket, isLoading: boolean, setIsLoading: Function, slug: string }) {

    const { isSelected, setIsSelected } = stateContext();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const initRef = useRef(false);
    const toolRef = useRef(isSelected);

    useEffect(() => {
        if (canvasRef.current && !initRef.current) {
            initRef.current = true;
            initDraw(canvasRef.current, roomID, socket, slug, toolRef);
        }
    }, [])
    useEffect(() => {
        toolRef.current = isSelected;
    }, [isSelected]);

    return <div className="relative">
        <canvas style={{
            width: "100vw",
            height: "100vh",
            border: "1px solid red",
            overflow: "scroll",
        }}
            ref={canvasRef}>
        </canvas>
        <Toolbar />
    </div>;
}