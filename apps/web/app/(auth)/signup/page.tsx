"use client";

import { useState } from "react";
import { CreateUserSchema } from "@repo/common/types";
import axios from "axios";
import { BACKEND_URL } from "../../../utils";
import { useRouter } from "next/navigation";

export default function SignUp() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignup = async () => {
        const checkData = CreateUserSchema.safeParse({
            email,
            password,
            name: email.split("@")[0]
        })

        if (!checkData.success) {
            alert("Incorrect data format")
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_URL}/signup`, {
                email,
                password,
                name: email.split("@")[0]
            });

            if (response.status === 200) {
                alert("User created successfully");
                router.push("/signin");
            }else if(response.status === 400) {
                alert("User already exists");
            }
            
        } catch (e) {
            console.log(e);
            alert("Something went wrong");
        }

    }


    return (
        <div className="flex flex-col gap-5 justify-center items-center h-screen bg-black">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" className="border border-[#d6d3d3] py-1 px-1.5 outline-0 rounded-lg bg-white" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" className="border border-[#d6d3d3] py-1 px-1.5 outline-0 rounded-lg bg-white" />
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Enter your password again" className="border border-[#d6d3d3] py-1 px-1.5 outline-0 rounded-lg bg-white" />
            <button onClick={() => handleSignup()} className="border border-emerald-700 bg-emerald-700 text-white py-1 px-2 rounded-lg cursor-pointer">
                Sign up
            </button>
        </div>
    );
}