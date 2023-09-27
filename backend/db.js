const mysql = require('mysql2')



const db = mysql.createConnection({
    host: 'IP ADDRESS',
    port: 'PORT',
    user: 'USERNAME',
    password: 'PASSWORD',
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
