const mysql = require('mysql2')



const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'admin',
    password: '0807',
    database: 'stick_it'
});

db.connect(function(err){
    if (err) {
        console.error('Error connecting to the database: ', err.stack);
        return;
    }
    console.log('Connected to the database with Thread ID:', db.threadId);
});
//export the connection or helper funct
module.exports = db;
