import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qpq25yJay#database',
    database: 'timetable',
    dateStrings: true,
});

console.log('Connected to MySQL!');
export default connection;
