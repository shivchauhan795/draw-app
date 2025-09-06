"use client";
import { createContext, useContext, useState } from "react";

const stateContexts = createContext<any>(null);

export function StateContextProvider({ children }: { children: React.ReactNode }) {
    const [isSelected, setIsSelected] = useState("")
    return (
        <stateContexts.Provider value={{
            isSelected, setIsSelected
        }}>{children}</stateContexts.Provider>
    );
}

export const stateContext = () => useContext(stateContexts);