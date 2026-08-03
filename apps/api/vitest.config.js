import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./test/global-setup.js'],
    env: {
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'test-secret-key',
      STRIPE_SECRET_KEY: 'sk_test_dummy',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_dummy',
      FRONTEND_URL: 'http://localhost:3000',
      PORT: '4001',
    },
    fileParallelism: false,
  },
});
