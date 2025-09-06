"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BACKEND_URL, getToken } from "../../../utils";
import { useSocket } from "../../hooks/useSocket";
import Canvas from "../../components/Canvas";
import { useParams, useRouter } from "next/navigation";

export default function CanvasPage() {
    const token = getToken();
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [roomID, setRoomID] = useState<Number>();

    const { socket, loading } = useSocket();


    const getRoomID = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/room/${params.roomId}`, {
                headers: {
                    Authorization: `${token}`
                }
            });
            if (!response.data || !response.data.id) {
                router.push("/");
                return;
            }
            setRoomID(response.data.id);

        } catch (error) {
            router.push("/");
        }
    }

    useEffect(() => {
        getRoomID();
    }, [])

    useEffect(() => {
        if (socket) {
            console.log("join room");
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: params.roomId
            }))
        }
    }, [socket])


    if (!socket || roomID === undefined) return <div>Loading...</div>;

    return <Canvas slug={params.roomId as string} roomID={roomID} socket={socket} isLoading={isLoading} setIsLoading={setIsLoading} />
}