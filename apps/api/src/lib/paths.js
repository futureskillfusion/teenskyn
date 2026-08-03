import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve paths relative to this file's location rather than process.cwd(),
// since the hosting platform may invoke the entry file from the repo root
// instead of from apps/api (unlike local dev, where we `cd apps/api` first).
const SRC_DIR = path.dirname(fileURLToPath(import.meta.url));
export const API_ROOT = path.join(SRC_DIR, '..', '..');
export const REPO_ROOT = path.join(API_ROOT, '..', '..');
export const UPLOADS_DIR = path.join(API_ROOT, 'uploads');
export const FRONTEND_DIST_DIR = path.join(REPO_ROOT, 'dist', 'apps', 'web');
