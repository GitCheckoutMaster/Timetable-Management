// db.js
import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',   // your DB host
    user: 'root',        // your DB user
    password: 'qpq25yJay#database',// your DB password
    database: 'timetable',     // your DB name
    dateStrings: true, // to handle date strings correctly
});

// connect
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

export default connection;
