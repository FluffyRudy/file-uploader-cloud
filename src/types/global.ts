import { AuthApiError, AuthTokenResponse } from "@supabase/supabase-js";
import { Request } from "express";

export type StorageAuthCredentials = {
    email: string;
    password: string;
};

export type StorageAuthResponse = Promise<AuthTokenResponse | AuthApiError>;

export type User = {
    id: string
    created_at?: Date
    email: string
    username: string
    password: string
    storage?: string
}

export interface SignInRequestBody extends Request {
    email: string,
    password: string
}

export interface SignUpRequestBody extends SignInRequestBody {
    username: string
}


