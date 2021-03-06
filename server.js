const mysql = require('mysql2/promise');
var express = require('express')
const cors = require('cors')
var app = express()
const port = process.env.PORT || 3000;

var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);

const config = {
    host: "eu-cdbr-west-01.cleardb.com",
    user: "bb33867687f242",
    password: "1d1d7748",
    database: "heroku_2dac715d3fc7515"
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

    app.use(
        cors({
            origin: 'https://exodusdg.github.io'
        })
    )

    app.get('/', (req, res) => {
        var IP = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);
        console.log(req.query);

        var newUserInfo = {
            'IP': IP,
            'URL': req.query.url,
            'Browser': req.query.browser,
            'Resolution': req.query.resolution
        }

        $.ajax({
            url: 'https://exo-portfolio-bot.herokuapp.com/new_user',
            method: 'get',
            dataType: 'json',
            async: false,
            data: newUserInfo,
            success: function(data) {
                console.log(data);
            }
        });

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

        res.json({ 'is_auth': '0' })
    })


    app.listen(port, () => {
        console.log(`Example app listening at https://exo-portfolio-server.herokuapp.com:${port}`)
    })
}

connectDB()