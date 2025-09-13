import { Metadata } from "next";
import AuthLayout from "./AuthLayout";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Dashboard page",
}

export default function SignInLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AuthLayout>{children}</AuthLayout>;
}