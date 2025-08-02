import mysql from 'mysql2/promise';

const pool = mysql.createPool({
   host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_NAME, 
});

export default pool;
