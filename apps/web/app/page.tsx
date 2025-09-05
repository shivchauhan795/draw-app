"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BACKEND_URL, getToken } from "../utils";
import axios from "axios";

export default function Home() {

  const router = useRouter();

  const token = getToken();
  const [roomName, setRoomName] = useState("");

  const createRoom = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/create-room`, {
        name: roomName
      }, {
        headers: {
          Authorization: `${token}`
        }
      });
      if (response.status !== 200) {
        console.error(response.data.message);
        return;
      }
      alert("Room created successfully");
      router.push(`/canvas/${roomName}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-700 gap-5">
      <input value={roomName} onChange={(e) => setRoomName(e.target.value)} className="border border-[#d6d3d3] py-1 px-1.5 outline-0 rounded-lg bg-white" placeholder="Enter room name to create room" />
      <button onClick={() => { createRoom(); }}
        className="border border-emerald-700 bg-emerald-700 text-white py-1 px-2 rounded-lg cursor-pointer">
        Create room
      </button>
    </div>
  );
}
