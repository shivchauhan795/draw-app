"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BACKEND_URL, getToken, getUser } from "../../../utils";
import { useSocket } from "../../hooks/useSocket";

interface Message {
    id: Number;
    message: string;
    roomId: Number;
    userId: string;
}

export default function Room() {
    const token = getToken()
    const user = getUser();
    const params = useParams();
    const [roomID, setRoomID] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const [currentMessage, setCurrentMessage] = useState("")
    const [messages, setMessages] = useState<Message[]>([]);

    const { loading, socket } = useSocket();

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "instant" });
    }, [messages]); // Only if messages might change

    const getRoomID = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/room/${params.slug}`, {
                headers: {
                    Authorization: `${token}`
                }
            });
            setRoomID(response.data.id);
        } catch (e) {
            console.error(e);
        }
    }

    const getMessages = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/chats/${roomID}`, {
                headers: {
                    Authorization: `${token}`
                }
            })
            console.log(response.data);
            setMessages(response.data.chats);
            setIsLoading(false);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        if (token) {
            getRoomID();
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        if (roomID) {
            getMessages();
        }
    }, [roomID]);

    useEffect(() => {
        if (socket && !loading) {
            socket.send(JSON.stringify({ type: "join_room", roomId: params.slug }));
            socket.onmessage = (message) => {
                console.log("in on message");
                const parsedData = JSON.parse(message.data);
                console.log(parsedData.message, "message");
                if (parsedData.type === "chat") {
                    setMessages((prev) => [...prev, {
                        id: parsedData.id,
                        message: parsedData.message,
                        roomId: parsedData.roomId,
                        userId: parsedData.userId
                    }]);
                }
            }
        }
    }, [socket, loading]);

    return (
        <div className="flex flex-col justify-between items-center h-screen py-5 bg-white">
            <h1 className="text-3xl border-b border-[#d6d3d3]">Welcome to Room: {params.slug}</h1>
            {
                isLoading && <div className="text-sm h-[80%] flex justify-center items-end text-[#202020] font-normal">Loading...</div>
            }
            {
                messages.length === 0 && <div className="text-sm h-[80%] flex justify-center items-end text-[#202020] font-normal">No messages yet.</div>
            }
            {
                messages.length > 0 &&
                <div style={{
                    scrollbarWidth: "thin",
                }} className={`h-[80%] overflow-y-scroll w-full px-20 mb-5 pb-5 flex flex-col`}>
                    {messages.sort((a, b) => (a.id > b.id ? 1 : -1)).map((message, idx) => {

                        const isMyMessage = message.userId === user;

                        return (
                            <div key={idx} className={`text-xl font-normal text-[#202020] my-5 py-1 rounded-t-2xl flex border border-[#d6d3d3] bg-[#e7e5e5] w-fit  bg- ${isMyMessage ? "self-end rounded-bl-2xl pl-3 pr-5" : "self-start rounded-br-2xl pl-3 pr-5"}`}>
                                <p className="wrap-break-word max-w-96">{message?.message}</p>
                            </div>
                        )
                    })}
                    <div ref={messageEndRef} />
                </div>
            }

            <div className="flex items-center gap-2 w-full px-20">
                <input type="text"
                    placeholder="Enter message"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="border border-[#b1aeae] py-1.5 pr-2 pl-3 outline-0 rounded-xl bg-white text-lg text-[#202020] w-full" />
                <button
                    onClick={() => {
                        socket?.send(JSON.stringify({ type: "chat", roomId: `${params.slug}`, message: currentMessage }))
                        setCurrentMessage("");
                    }}
                    className="border border-emerald-700 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-3 rounded-xl cursor-pointer text-sm flex items-center gap-1">
                    Send
                    <img src="/send.svg" alt="send" className="w-4 h-4 min-w-4 min-h-4 object-contain shrink-0" />
                </button>
            </div>
        </div>
    );
} 