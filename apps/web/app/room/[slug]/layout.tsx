import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Room",
    description: "Room page",
}

export default function RoomLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}