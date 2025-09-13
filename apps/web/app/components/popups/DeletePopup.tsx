"use client";
import axios from 'axios';
import CloseIcon from '../../icons/dashboard/closeIcon.svg';
import Image from 'next/image';
import { BACKEND_URL, getToken } from '../../../utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { stateContext } from '../../utils/context/stateContext';
import toast from 'react-hot-toast';

export function DeletePopup() {
    const router = useRouter();
    const token = getToken();
    const { deltePopupOpen, setIsDeltePopupOpen, roomIdToBeDeleted, setRoomIdToBeDeleted } = stateContext();
    const deleteRoom = async () => {
        try {
            const response = await axios.delete(`${BACKEND_URL}/room/${roomIdToBeDeleted}`,
                {
                    headers: {
                        Authorization: `${token}`
                    }
                });
            toast.success(response.data.message);
            setIsDeltePopupOpen(false);
        } catch (e) {
            toast.error("Something went wrong");
        }
    }
    return (
        <div className="absolute top-0 left-0 w-screen h-screen bg-black/50 flex justify-center items-center">
            <div className="bg-white border w-1/5 h-1/4 border-[#4d4c4c] rounded-lg">
                <div className='w-full flex justify-end'>
                    <div className='p-2'>
                        <Image onClick={() => { setIsDeltePopupOpen(false) }} src={CloseIcon} alt="close icon" className='w-5 h-5 min-w-5 min-h-5 object-contain shrink-0 cursor-pointer' />
                    </div>
                </div>
                <div className='w-full flex flex-col justify-center items-center gap-4'>
                    <div className='text-2xl font-bold'>
                        Delete Room
                    </div>
                    <div className='text-lg font-medium'>
                        Are you sure you want to delete this room?
                    </div>
                    <div className='mt-5'>
                        <button onClick={() => deleteRoom()} className='border py-0.5 px-10 text-lg font-semibold rounded-lg shadow-xl bg-[#db6763] text-black cursor-pointer hover:bg-[#e9342e]'>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    )
}