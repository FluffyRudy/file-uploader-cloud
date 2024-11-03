import { AuthApiError, AuthTokenResponse } from "@supabase/supabase-js";
import { Request } from "express";

export type LoginCredentials = {
    email: string;
    password: string;
};

export type LoginResponse = Promise<AuthTokenResponse | AuthApiError>;

export type User = {
    id: String
    email: String
    username: string
    password: string
}

export interface SignInRequestBody extends Request {
    email: string,
    password: string
}

export interface SignUpRequestBody extends SignInRequestBody {
    username: string
}


