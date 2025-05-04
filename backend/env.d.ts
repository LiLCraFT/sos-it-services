declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    JWT_SECRET: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
  }
} 