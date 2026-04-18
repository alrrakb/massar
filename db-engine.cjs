#!/usr/bin/env node
/**
 * Database Engine - CLI tool for Supabase PostgreSQL queries
 * Usage: node db-engine.cjs "SELECT * FROM profiles LIMIT 5;"
 */

const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Error: DATABASE_URL not found in environment.');
    console.error('Please create a .env file with: DATABASE_URL=postgresql://postgres:password@host:port/database');
    process.exit(1);
}

const args = process.argv.slice(2);
const forceFlag = args.includes('--force');
const query = args.filter(a => !a.startsWith('--')).join(' ');

if (!query) {
    console.error('Error: No SQL query provided.');
    console.error('Usage: node db-engine.cjs "SELECT * FROM profiles LIMIT 5;"');
    console.error('Optional: node db-engine.cjs "TRUNCATE table;" --force');
    process.exit(1);
}

const dangerousKeywords = ['TRUNCATE', 'DROP', 'DELETE'];
const hasDangerous = dangerousKeywords.some(kw => query.toUpperCase().includes(kw));

if (hasDangerous && !forceFlag) {
    console.error('\n⚠️  SAFETY WARNING: Potentially destructive operation detected!');
    console.error(`Query: ${query}`);
    console.error('\nThis query contains one of: TRUNCATE, DROP, DELETE');
    console.error('To proceed, add --force flag:');
    console.error('  node db-engine.cjs "TRUNCATE table;" --force\n');
    process.exit(1);
}

if (hasDangerous && forceFlag) {
    console.warn('\n⚠️  WARNING: Executing destructive query with --force flag.\n');
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function executeQuery(sql) {
    const client = await pool.connect();
    try {
        const result = await client.query(sql);
        
        if (result.rows && result.rows.length > 0) {
            console.log(JSON.stringify({
                success: true,
                rowCount: result.rowCount,
                rows: result.rows
            }, null, 2));
        } else if (result.command) {
            console.log(JSON.stringify({
                success: true,
                command: result.command,
                rowCount: result.rowCount || 0,
                rows: []
            }, null, 2));
        } else {
            console.log(JSON.stringify({ success: true }, null, 2));
        }
        
        return result;
    } catch (err) {
        console.error(JSON.stringify({
            success: false,
            error: err.message,
            code: err.code
        }, null, 2));
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

executeQuery(query);