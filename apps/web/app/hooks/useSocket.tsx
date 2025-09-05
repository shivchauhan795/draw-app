import { useEffect, useState } from "react";

export function useSocket() {
    const [loading, setloading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:3002?token=" + localStorage.getItem("token"));
        ws.onopen = () => {
            setloading(false);
            setSocket(ws);
        }
    }, []);

    return { loading, socket };

}