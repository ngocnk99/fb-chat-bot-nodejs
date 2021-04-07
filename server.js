// # SimpleServer
// A simple chat bot server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
var server = http.createServer(app);
var request = require("request");
const { text } = require('body-parser');

app.get('/', (req, res) => {
    res.send("Home page. Server running okay.");
});

// Đây là đoạn code để tạo Webhook
app.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === 'ngoc99token') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});

// Xử lý khi có người nhắn tin cho bot

app.post('/webhook', function(req, res) {
    console.log("co tin nhan")
    var entries = req.body.entry;
    console.log("thong tin", entries[0].messaging)
    for (var entry of entries) {
        var messaging = entry.messaging;
        for (var message of messaging) {
            var senderId = message.sender.id;
            if (message.message) {
                // If user send text
                if (message.message.text) {
                    var text = message.message.text;
                    console.log(text); // In tin nhắn người dùng
                    sendMessage(senderId, "Tui là bot đây: " + text);
                }
            }
        }
    }
    res.status(200).send("OK");
});

// Gửi thông tin tới REST API để trả lời
function sendMessage(senderId, message) {
    console.log(senderId, message)
    request({
        url: "https://graph.facebook.com/v2.6/me/messages?access_token=EAACMF3jd5ZCIBAC8bMDiVoTvnNLO3qGqKEZAT4NrGZCVmKeNQ4SA4oaNXkYYhYxyYl8KfJtNMJoZBhjkcn98g30BNGrruIBDFEM8oAxscDVNfE53AO8a9zBhaAXWZBTPCZBhMuXAGnqsEi2C29jGF3pRX5DyAedOFFKU6IOWLxFDeBauTbzXJf",
        method: 'POST',
        json: {
            "recipient": {
                "id": senderId
            },
            "message": {
                "text": message
            },
        }
    });
}

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1");

server.listen(app.get('port'), app.get('ip'), function() {
    console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});