import type { Metadata } from "next";
import AuthLayout from "./AuthLayout";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Sign Up page",
}

export default function SignUpLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AuthLayout>{children}</AuthLayout>;
}