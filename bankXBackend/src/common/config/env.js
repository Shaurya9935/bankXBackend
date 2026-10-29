import "dotenv/config";

const required = (name, fallback) => process.env[name] || fallback;

export const env = {
  port: Number(required("PORT", "3000")),
  nodeEnv: required("NODE_ENV", "development"),
  corsOrigin: required("CORS_ORIGIN", "http://localhost:5173"),
  jwtSecret: required("JWT_SECRET", "development-only-change-this-secret"),
  jwtExpiresIn: required("JWT_EXPIRES_IN", "1d"),
  db: {
    host: required("DB_HOST", "localhost"),
    port: Number(required("DB_PORT", "3306")),
    user: required("DB_USER", "root"),
    password: required("DB_PASSWORD", "root"),
    database: required("DB_NAME", "banking_systems"),
    connectionLimit: Number(required("DB_CONNECTION_LIMIT", "10"))
  }
};

if (env.nodeEnv === "production" && env.jwtSecret === "development-only-change-this-secret") {
  throw new Error("JWT_SECRET must be set in production");
}