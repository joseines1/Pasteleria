const { createClient } = require('@libsql/client');
const { TURSO_DATABASE_URL, TURSO_SECRET_KEY } = require('../constants');

const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_SECRET_KEY
});

module.exports = client; 