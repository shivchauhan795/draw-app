"use client";
import axios from 'axios';
import CloseIcon from '../../icons/dashboard/closeIcon.svg';
import Image from 'next/image';
import { BACKEND_URL, getToken } from '../../../utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { stateContext } from '../../utils/context/stateContext';
import toast from 'react-hot-toast';

export function CreateRoomPopup() {
    const router = useRouter();
    const token = getToken();
    const [roomName, setRoomName] = useState("");
    const { createRoomPopupOpen, setIsCreateRoomPopupOpen } = stateContext();
    const createRoom = async () => {
        if (roomName.length < 3 || roomName.length > 20) {
            // alert("Room name must be between 3 and 20 characters");
            toast.error("Room name must be between 3 and 20 characters");
            return;
        }
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
            // alert("Room created successfully");
            toast.success("Room created successfully");
            setIsCreateRoomPopupOpen(false);
            router.push(`/canvas/${roomName}`);
        } catch (e) {
            console.error(e);
        }
    };
    return (
        <div className="absolute top-0 left-0 w-screen h-screen bg-black/50 flex justify-center items-center">
            <div className="bg-white border w-1/5 h-1/4 border-[#4d4c4c] rounded-lg">
                <div className='w-full flex justify-end'>
                    <div className='p-2'>
                        <Image onClick={() => { setIsCreateRoomPopupOpen(false) }} src={CloseIcon} alt="close icon" className='w-5 h-5 min-w-5 min-h-5 object-contain shrink-0 cursor-pointer' />
                    </div>
                </div>
                <div className='w-full flex flex-col justify-center items-center gap-4'>
                    <div className='text-2xl font-bold'>
                        Create Room
                    </div>
                    <div>
                        <input value={roomName} onChange={(e) => setRoomName(e.target.value)} type="text" placeholder="Room Name" className='border border-[#4d4c4c] px-2 rounded-lg outline-none' maxLength={20} minLength={3} />
                    </div>
                    <div className='mt-5'>
                        <button onClick={() => createRoom()} className='border py-0.5 px-10 text-lg font-semibold rounded-lg shadow-xl bg-[#d3ffd2] text-black cursor-pointer hover:bg-[#bcfabb]'>Create</button>
                    </div>
                </div>
            </div>
        </div>
    )
}