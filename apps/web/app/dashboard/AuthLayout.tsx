"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // 👈 separate loading state
    const router = useRouter();

    useEffect(() => {
        const storedToken = getToken();
        setToken(storedToken);
        setIsLoading(false); // ✅ done loading
        if (!storedToken) {
            router.push("/signin"); // redirect if token exists
        }
    }, []);

    if (isLoading) return null; // 🕐 wait while checking localStorage

    return <>{token && children}</>;
}
