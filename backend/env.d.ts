declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    JWT_SECRET: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
  }
} 