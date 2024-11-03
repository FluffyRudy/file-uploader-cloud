declare namespace NodeJS {
    interface ProcessEnv {
        DEV_DATABASE_URL: string,
        DATABASE_URL: string,
        SUPABASE_URL: string,
        SUPABASE_KEY: string,
        SESSION_COOKIE_SECRET: string,
        SUPABASE_EMAIL: string,
        SUPBASE_PASSWORD: string
    }
}