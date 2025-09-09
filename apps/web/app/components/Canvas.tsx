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
    const panRef = useRef({
        panX: 0,
        panY: 0,
        scale: 1,
        updateCanvas: () => { }
    });
    useEffect(() => {
        if (canvasRef.current && !initRef.current) {
            initRef.current = true;
            initDraw(canvasRef.current, roomID, socket, slug, toolRef, panRef);
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white">
            {/* <p>Scroll X: {panRef.current.panX.toFixed(0)} | Y: {panRef.current.panY.toFixed(0)}</p> */}
            <p>Zoom: {Math.round(panRef.current.scale * 100)}%</p>
        </div>
    </div>;
}