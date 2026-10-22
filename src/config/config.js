import "dotenv/config";

const config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGO_URI,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};

export default config;
