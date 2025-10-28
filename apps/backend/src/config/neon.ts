import { Pool, PoolClient } from 'pg';

// Configuration de la connexion Neon PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not configured. Database operations will fail.');
}

// Créer le pool de connexions PostgreSQL
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // Maximum de connexions dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Gérer les erreurs du pool
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Exécuter une requête SQL avec le contexte utilisateur pour RLS
 * @param userId - ID de l'utilisateur authentifié
 * @param queryFn - Fonction qui exécute les requêtes SQL avec le client
 */
export async function withUserContext<T>(
  userId: string,
  queryFn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    // Définir l'user_id dans la session pour RLS
    await client.query('SELECT set_config($1, $2, true)', ['app.current_user_id', userId]);

    // Exécuter la fonction de requête
    const result = await queryFn(client);

    return result;
  } finally {
    // Nettoyer la session et libérer le client
    await client.query('SELECT set_config($1, $2, true)', ['app.current_user_id', '']);
    client.release();
  }
}

/**
 * Exécuter une requête SQL sans contexte utilisateur (pour les opérations publiques)
 * @param queryFn - Fonction qui exécute les requêtes SQL avec le client
 */
export async function withoutUserContext<T>(
  queryFn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    const result = await queryFn(client);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Exécuter une requête SQL simple avec le contexte utilisateur
 * @param userId - ID de l'utilisateur authentifié
 * @param query - Requête SQL
 * @param params - Paramètres de la requête
 */
export async function query<T = any>(
  userId: string | null,
  query: string,
  params?: any[]
): Promise<T[]> {
  if (userId) {
    return withUserContext(userId, async (client) => {
      const result = await client.query(query, params);
      return result.rows;
    });
  } else {
    return withoutUserContext(async (client) => {
      const result = await client.query(query, params);
      return result.rows;
    });
  }
}

/**
 * Exécuter une requête SQL qui retourne une seule ligne
 * @param userId - ID de l'utilisateur authentifié
 * @param query - Requête SQL
 * @param params - Paramètres de la requête
 */
export async function queryOne<T = any>(
  userId: string | null,
  queryText: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(userId, queryText, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Exécuter une transaction avec le contexte utilisateur
 * @param userId - ID de l'utilisateur authentifié
 * @param transactionFn - Fonction qui exécute les requêtes dans la transaction
 */
export async function transaction<T>(
  userId: string | null,
  transactionFn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const executeFn = async (client: PoolClient) => {
    try {
      await client.query('BEGIN');
      const result = await transactionFn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  };

  if (userId) {
    return withUserContext(userId, executeFn);
  } else {
    return withoutUserContext(executeFn);
  }
}

/**
 * Vérifier la connexion à la base de données
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connected to Neon PostgreSQL');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Neon PostgreSQL:', error);
    return false;
  }
}

/**
 * Fermer le pool de connexions
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('🔒 Neon PostgreSQL pool closed');
}

// Vérifier la connexion au démarrage
checkConnection();

export default pool;
