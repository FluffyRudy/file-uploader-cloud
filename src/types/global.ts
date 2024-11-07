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

export interface FileObject {
    name: string;
    bucket_id: string;
    owner: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: Record<string, any>;
}