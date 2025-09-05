import {z} from "zod";

export const CreateUserSchema = z.object({
    name: z.string().min(3).max(20),
    email: z.email(),
    password: z.string().min(6).max(20),
});

export const SignupSchema = z.object({
    email: z.email().min(3).max(20),
    password: z.string().min(6).max(20),
});

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20),
});