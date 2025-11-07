import { Pool } from 'pg';

class PoolSingleton extends Pool {
  constructor(config) {
    super(config);

    if (!PoolSingleton.instance) {
      PoolSingleton.instance = this;
    }
    return PoolSingleton.instance;
  }
}

export const pool = new PoolSingleton({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
  host: 'localhost',

  user: 'db-user',
  password: 'db-password',
  port: 5435,
  database: 'db-name',
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const resendApiKey = 'resend_api_key_1234567890';
