"use client";
import { createContext, useContext, useState } from "react";

const stateContexts = createContext<any>(null);

export function StateContextProvider({ children }: { children: React.ReactNode }) {
    const [isSelected, setIsSelected] = useState("");
    const [createRoomPopupOpen, setIsCreateRoomPopupOpen] = useState(false);
    const [deltePopupOpen, setIsDeltePopupOpen] = useState(false);
    const [roomIdToBeDeleted, setRoomIdToBeDeleted] = useState("");
    return (
        <stateContexts.Provider value={{
            isSelected, setIsSelected,
            createRoomPopupOpen, setIsCreateRoomPopupOpen,
            deltePopupOpen, setIsDeltePopupOpen,
            roomIdToBeDeleted, setRoomIdToBeDeleted
        }}>{children}</stateContexts.Provider>
    );
}

export const stateContext = () => useContext(stateContexts);