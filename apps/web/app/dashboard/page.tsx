"use client";
import { Topbar } from "../components/dashboard/Topbar";
import Image from "next/image";
import LandingImage from '../icons/landing/mainImage.svg';
import DeleteIcon from '../icons/dashboard/deleteIcon.svg';
import { useEffect, useState } from "react";
import { BACKEND_URL, getToken } from "../../utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CreateRoomPopup } from "../components/popups/CreateRoomPopup";
import { stateContext } from "../utils/context/stateContext";
import { Toaster } from "react-hot-toast";
import { DeletePopup } from "../components/popups/DeletePopup";

interface Room {
    id: number;
    slug: string;
}

export default function Dashboard() {
    const token = getToken();
    const router = useRouter();
    const [rooms, setRooms] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const { createRoomPopupOpen, setIsCreateRoomPopupOpen, deltePopupOpen, setIsDeltePopupOpen, roomIdToBeDeleted, setRoomIdToBeDeleted } = stateContext();

    const getRooms = async () => {
        try {
            setisLoading(true);
            const response = await axios(`${BACKEND_URL}/rooms`, {
                method: "GET",
                headers: {
                    Authorization: `${token}`,
                },
            });
            setRooms(response.data);
            setisLoading(false);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getRooms();
    }, [deltePopupOpen, createRoomPopupOpen]);
    return (
        <div className="h-screen px-5 pt-5">
            <Toaster position="top-center" reverseOrder={false} />
            {
                createRoomPopupOpen &&
                <CreateRoomPopup />
            }
            {
                deltePopupOpen &&
                <DeletePopup />
            }
            <Topbar />
            <div className="mt-10 mb-2 pl-6">
                <h1 className="text-2xl font-medium">Current Canvas</h1>
            </div>
            <div style={{ scrollbarWidth: "thin" }} className="flex flex-wrap h-[80vh] overflow-y-auto gap-5 py-5 px-5">
                {
                    isLoading && <h1>Loading...</h1>
                }
                {
                    !isLoading && rooms.map((room: Room) => (
                        <div
                            key={room.id}
                            onClick={() => {
                                router.push(`/canvas/${room.slug}`);
                            }}
                            className="border w-52 h-42 rounded-lg flex flex-col justify-center items-center shadow-xl cursor-pointer">
                            <Image src={LandingImage} alt="Landing Image" className="overflow-hidden" />
                            <div className="flex items-center justify-between w-full border-t pt-1 border-[#4d4c4c] px-2">
                                <div className="w-full text-base font-bold capitalize">
                                    {room.slug}
                                </div>
                                <Image onClick={(e) => {
                                    e.stopPropagation();
                                    setRoomIdToBeDeleted(room.id);
                                    setIsDeltePopupOpen(true);
                                }} src={DeleteIcon} alt="delete icon" className="w-5 h-5 min-w-5 min-h-5 object-contain shrink-0" />
                            </div>
                        </div>
                    ))

                }
            </div>
        </div>
    )
}