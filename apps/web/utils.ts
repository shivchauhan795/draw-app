
export const BACKEND_URL = "http://localhost:3001";

export function getToken() {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null; // or undefined
}


export function getUser() {
    if (typeof window !== "undefined") {
        return localStorage.getItem("user");
    }
    return null; // or undefined
}