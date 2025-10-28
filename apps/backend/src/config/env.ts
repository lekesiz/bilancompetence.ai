import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');
const backendDir = path.resolve(__dirname, '../');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(backendDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(backendDir, '.env') });
