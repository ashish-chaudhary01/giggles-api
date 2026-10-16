import "dotenv/config";

const config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGO_URI,
};

export default config;
