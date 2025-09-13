"use client";

import { useState } from "react";
import { CreateUserSchema, SignupSchema } from "@repo/common/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../../../utils";
import toast, { Toaster } from "react-hot-toast";

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        const checkData = SignupSchema.safeParse({
            email,
            password
        })

        if (!checkData.success) {
            // alert("Incorrect data format")
            toast.error("Incorrect data format");
            return;
        }


        try {
            const response = await axios.post(`${BACKEND_URL}/signin`, {
                email,
                password
            });

            if (response.status === 200) {
                // alert("Login Successfully");
                toast.success("Login Successfully");
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", response.data.userId);
                router.push("/dashboard");
            } else if (response.status === 400) {
                // alert("Loggin failed");
                toast.error("Loggin failed");
            }

        } catch (e) {
            console.log(e);
            // alert("Something went wrong");
            toast.error("Something went wrong");
        }

    }


    return (
        <div className="flex flex-col gap-5 justify-center items-center h-screen bg-black">
            <Toaster position="top-center" reverseOrder={false} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" className="border border-[#d6d3d3] py-1 px-1.5 outline-0 rounded-lg bg-white" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" className="border border-[#d6d3d3] py-1 px-1.5 outline-0 rounded-lg bg-white" />
            <button onClick={() => handleSignup()} className="border border-emerald-700 bg-emerald-700 text-white py-1 px-2 rounded-lg cursor-pointer">
                Sign in
            </button>
        </div>
    );
}