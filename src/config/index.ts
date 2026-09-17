import dotenv from 'dotenv';
import path from 'path';
import type { StringValue } from 'ms';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  database_url: process.env.DATABASE_URL,
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN as StringValue,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
  google_client_id: process.env.GOOGLE_CLIENT_ID!,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  google_callback_url: process.env.GOOGLE_REDIRECT_URI!,
  frontend_url: process.env.FRONTEND_URL,
  backend_api_url: process.env.BACKEND_API_URL,
  avatar_s3_base_url: process.env.AVATAR_S3_BASE_URL,
};
