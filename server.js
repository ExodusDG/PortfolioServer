const mysql = require('mysql2/promise');
var express = require('express')

var app = express()
const port = 3000;

var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);

const config = {
    host: "localhost",
    user: "admin",
    password: "aopyhtJ0lt)/BTDr",
    database: "portfolio"
}

//Connect
async function connectDB() {
    const conn = await mysql.createConnection(config);

    conn.connect(err => {
        if (err) {
            console.log(err)
            return err;
        } else {
            console.log('DATABASE OK');
        }
    });

    app.get('/', (req, res) => {
        IP = req.connection.remoteAddress;
        console.log(req.query);

        var newUserInfo = {
            'IP': IP,
            'URL': req.query.url,
            'Browser': req.query.browser,
            'Resolution': req.query.resolution
        }



        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000/");
        res.setHeader("Access-Control-Allow-Origin", "*");
        //    res.json({ 'status': 'ok' })
        res.json(newUserInfo);

    })


    app.get('/admin', (req, res) => {
        var IP;
        var nickname;
        IP = req.connection.remoteAddress;
        GetUserData()
        async function GetUserData() {
            const [rows] = await conn.execute('SELECT * FROM `users`')
            userData = rows;
            var is_auth;

            $.each(userData, function(key, value) {
                if (value.ip == IP) {
                    is_auth = value.is_auth;
                    nickname = value.login;
                    return false;
                }
            });
            console.log(nickname)
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000/");
            res.setHeader("Access-Control-Allow-Origin", "*");

            if (is_auth == 1) {
                res.json({ 'status': 'IP allowed!', 'login': nickname });

            } else {
                res.json({ 'status': 'IP not allowed!' });
            }
        }
    })


    app.get('/auth', (req, res) => {
        IP = req.connection.remoteAddress;

        var inputData = req.query;
        conn.query('UPDATE `users` SET `is_auth` = "1", `ip` = "' + IP + '" WHERE `login` = "' + inputData.login + '"')

        GetUserData()
        async function GetUserData() {
            const [rows] = await conn.execute('SELECT * FROM `users`')
            userData = rows;

            var isDataValid = 0;

            $.each(userData, function(key, value) {
                if (inputData.login == userData[key].login & inputData.password == userData[key].password) {
                    isDataValid = 1;
                    return false;
                } else {
                    isDataValid = 0;
                }
            });

            res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000/");
            res.setHeader("Access-Control-Allow-Origin", "*");

            if (isDataValid == 1) {
                res.json({ 'status': 'Done!' });

            } else {
                res.json({ 'status': 'Error!' });
            }
        }
    })

    app.get('/logout', (req, res) => {
        IP = req.connection.remoteAddress;

        conn.query('UPDATE `users` SET `is_auth` = "0" WHERE `ip` = "' + IP + '"')


        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000/");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json({ 'is_auth': '0' })
    })


    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}

connectDB()