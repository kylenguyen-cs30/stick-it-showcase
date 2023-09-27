const express = require('express');
const bodyParser  = require('body-parser');
const cors = require('cors');
// const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2')
const db = require('./db.js');
const session = require('express-session');



const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

app.use(session({
    secret: 'Pandapoops2023!', // Choose a strong secret key for encrypting the session
    resave: false,
    saveUninitialized: true,
    cookie: {secure:false , maxAge : 60000} // Use `secure: true` if you are using HTTPS
}));
// app.use(morgan('morgan'));




//DELETE HTTP method to remove drop a record in the database.
app.delete("/api/tasks/:todo_id" , (req,res) => {
    const todoId = req.params.todo_id;
    console.log("task id: ", todoId);
    if (!todoId || todoId === "null") {
        return res.status(400).send('Invalid task ID');
    }
    

    const deleteQuery = "DELETE FROM todo WHERE todo_id = ?";
    db.query(deleteQuery , [todoId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Server error while delete the task.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Task not found');
        }
        res.status(200).json({ message: "Task Deleted"});
    });


});



//DATABASE (AUTH/REGISTER)
//Authentication for login users. 
app.post('/auth/login' , (req, res) =>{
    console.log(req.body);
    const {username, password} = req.body;

    // fetch user from database using username
    const query = 'SELECT * FROM user WHERE username = ?';
    db.query(query, [username] , (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        const user = result[0];

        if (!user) {
            return res.status(400).send('User not found');
        }

        // log both passwords for debugging
        console.log("Provide password:" , password);
        console.log("Hashed password from DB:",user.hashed_password);

        // Compare the hashed passwords
        bcrypt.compare(password, user.hashed_password, (err, isMatch) =>{
            if (err) {
                console.err(err);
                return res.status(500).send('Server successful!');
            }

            if (isMatch) {
                req.session.userId = user.user_id;; // store user's ID in the session.
                console.log("User authenticated with ID:", user.user_id);
                return res.redirect('/main.html');
            } else {
                return res.status(400).send('Incorrect password');
            }
        });
    });
});

//Register user
app.post('/auth/register' ,(req, res) => {
    console.log(req.body);
    const {username, password, email} = req.body;

    // check if the username already exist
    const checkUserQuery = 'SELECT * FROM user WHERE username = ?';
    db.query(checkUserQuery, [username] , (err, result) => {

        //error from parsing server
        if(err){
            console.error(err);
            return res.status(500).send('Server Error');
        }

        if (result.length > 0) {
            return res.status(400).send('Username already exist.');
        }

        // if the user name does not exist, hash password
        bcrypt.hash(password, 10, (err, hashedPassword) => {


            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }

            //store the user data in the database
            const insertUserQuery = 'INSERT INTO user (username, hashed_password, email) VALUES (?,?,?)';
            db.query(insertUserQuery, [username, hashedPassword,email], (err,result) =>{
                if (err) {
                    console.error(err);
                    return res.status(500).send('Server error');
                }

                res.redirect('/main.html');
            });
        });
    });
});

//ADD DATAS TO THE CURRENT USER
app.post('/api/tasks', (req, res) => {
    //extract user ID 
    const userId = req.session.userId;
    //check userId
    if (!userId) {
        console.log("User not authenticated.");
        return res.status(401).send('Not authenticated');
    }
    //extract task details from the request body
    const { task_description } = req.body;
    //Query to insert the new task into the database
    const insertTaskQuery = ` INSERT INTO todo (user_id, task_description, status) VALUES (?, ?,'pending') `;
    db.query(insertTaskQuery, [userId, task_description] , (err,result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Server error while adding the task.');
        }
        res.status(200).json({message: 'Task added succesfully', todo_id: result.insertId });
    });
});



//fetch and display
app.get('/api/tasks' ,(req,res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).send('Not Authenticated!');
    }

    const fetchTaskQuery = 'SELECT * FROM todo WHERE user_id = ?';
    db.query(fetchTaskQuery , [userId], (err, results) =>{
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).send('Server error while fetching the tasks.');
        }
        res.json(results);
    });
});



//ROUTING USER SIGN OUT
app.post('/auth/signout' , (req, res) => {
    req.session.destroy((err) =>{
        if (err) {
            return res.status(500).send('Server error during logout');
        }
        res.redirect('../index.html');
    });
});


// console.log("Path:" , __dirname + '/../public/index.html')

//error handling
app.use((err, req, res, next) =>{
    if(err){
        console.log(err.stack);
        res.status(500).send("Something broke!");
    }else{
        next();
    }
});


//ROUTING

//express will find folder 'public' show index.html 
app.use(express.static('public'));

// app.use(express.static(path.join(__dirname, '..')));


// app.use(express.static(path.join(__dirname)));

// app.use(express.static(__dirname));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });



//Error Handling:
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('something broke!');
});     


//start server
const PORT = 3000;
app.listen(PORT, () => { console.log(`server is running on port ${PORT}`);})




/*
NOTES : 
- we need to implement a way to authenticate the users for the Notes. 
- Adding Log in Page
- Adding USER DATA


//THIS WORKS
// app.get('/' , (req, res) =>{
//     res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
// });

*/

