#!/usr/bin/env node
/**
 * Supabase Database Bridge Script - File Version
 * Executes SQL queries from a file via the Supabase Management API
 */

const https = require('https');
const fs = require('fs');

const PROJECT_REF = 'rbhvueszkkbavtzwqylg';
const ACCESS_TOKEN = 'sbp_6931716ec1d77a9a307fff64d3cad9b4a6f6c452';

function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ query: sql });

        const options = {
            hostname: 'api.supabase.com',
            port: 443,
            path: `/v1/projects/${PROJECT_REF}/database/query`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Request failed: ${e.message}`));
        });

        req.write(body);
        req.end();
    });
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: node db-execute-file.js <sql-file>');
        process.exit(1);
    }

    const filePath = args[0];
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL by semicolon to execute statements individually
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements on project ${PROJECT_REF}...`);
    console.log('---');

    for (let i = 0; i < statements.length; i++) {
        const sql = statements[i] + ';';
        console.log(`\n[${i + 1}/${statements.length}] Executing: ${sql.substring(0, 100)}...`);
        
        try {
            const result = await executeSQL(sql);
            console.log('Result:', JSON.stringify(result, null, 2));
        } catch (error) {
            console.error('Error:', error.message);
            // Continue with next statement
        }
    }

    console.log('\n---\nDone!');
}

main();
