import { AuthApiError, AuthTokenResponse } from "@supabase/supabase-js";

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