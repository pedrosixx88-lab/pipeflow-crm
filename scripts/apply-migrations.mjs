// scripts/apply-migrations.mjs
// Aplica as migrations do PipeFlow CRM no Supabase Cloud via conexão direta PostgreSQL.
// Uso: node scripts/apply-migrations.mjs

import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));

// Connection string do Supabase (porta 5432 — pooler transacional, porta 6543)
// Para DDL usa-se conexão direta (5432), não o pooler (6543).
const PROJECT_REF = 'njvrmuvekgjcvxmizfla';
const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error('❌  Defina DB_PASSWORD antes de executar este script.');
  console.error('   Exemplo: $env:DB_PASSWORD="sua-senha"; node scripts/apply-migrations.mjs');
  process.exit(1);
}

const connectionString =
  `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`;

const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅  Conectado ao banco de dados.\n');

    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), 'utf8');
      console.log(`🔄  Aplicando ${file}...`);
      try {
        await client.query(sql);
        console.log(`✅  ${file} aplicado com sucesso.\n`);
      } catch (err) {
        console.error(`❌  Erro em ${file}:`);
        console.error(`    ${err.message}\n`);
        // Continua para as próximas migrations
      }
    }

    console.log('🎉  Todas as migrations processadas.');
  } finally {
    await client.end();
  }
}

run().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
