/**
 * This is the backend for our site.
 * It's pretty simple, and there's tons of room for improvement and cleanup.
 * Note that the encryption algorithm can produce different outputs based on random variation,
 * even when using the same input parameters.
 */
// basic express server
const encrypt = require('encrypt-with-password');
var express = require('express');
var app = express();
var fs = require('fs');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
}).listen(3000);

app.get('/post', function(req, res) {
    // two url args: title and content
    var title = req.query.title;
    var content = req.query.content;
    console.log(title);
    console.log(content);
    res.send("Success!");

    const passkey = "password";

    // save the title and content to a file called "posts.txt" as a JSON object
    var post = {
        title: encrypt.encrypt(title, passkey),
        content: encrypt.encrypt(content, passkey)
    };

    // append
    fs.appendFile('posts.txt', JSON.stringify(post) + '\n', function(err) {
        if (err) throw err;
        console.log('Saved!');
    });
});

app.get('/getposts', function(req, res) {
    // read posts from the file posts.txt, and format into json
    fs.readFile('posts.txt', 'utf8', function(err, data) {
        // err handling
        if (err) throw err;
        res.send(data);
    });
});

// decrypt
app.get('/decrypt', function(req, res) {
    // if no url params, send "error"
    if (!req.query.passkey) {
        res.send("No Passkey Provided");
    } else {
        // two url args: passkey and content
        var passkey = req.query.passkey;
        var content = req.query.content;

        console.log(passkey + " " + content);

        const decryptedContent = encrypt.decrypt(content, passkey);
        console.log(decryptedContent);
        res.send(decryptedContent);
    }
});

// serve anything in the static folder
app.get('/static/*', function(req, res) {
    res.sendFile(__dirname + '/static/' + req.params[0]);
});

console.log('Server running at http://localhost:3000/');