"use client";
import { useRouter } from "next/navigation";
import { stateContext } from "../../utils/context/stateContext";
import Logout from '../../icons/dashboard/logout.svg';
import Image from 'next/image';
import toast from "react-hot-toast";

export function Topbar() {
    const router = useRouter();
    const { createRoomPopupOpen, setIsCreateRoomPopupOpen } = stateContext();
    return (
        <div className="w-full flex justify-between items-center border py-3 px-3 rounded-lg border-[#4d4c4c] bg-[#ffaf22] shadow-xl">
            <h1 onClick={() => router.push('/')} className="text-2xl font-extrabold cursor-pointer">Draw App</h1>
            <div className="flex items-center gap-2">
                <div onClick={() => setIsCreateRoomPopupOpen(true)} className="border py-0.5 px-5 text-lg font-semibold rounded-lg shadow-xl bg-[#d3ffd2] text-black cursor-pointer hover:bg-[#bcfabb]">Create Room</div>
                <Image onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/signin');
                    toast.success("Logout Successfully");
                }} title="Logout" src={Logout} alt="logout" className='w-7 h-7 min-w-7 min-h-7 object-contain shrink-0 cursor-pointer' />
            </div>
        </div>
    )
}