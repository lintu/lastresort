var express = require('express');
var app = express();
var path = require('path');
var multer = require('multer');
var fs = require('fs');
var uuid = require('uuid');
var jsmediatags = require("jsmediatags");
var btoa = require('btoa');


app.use(express.static(path.join(__dirname, '')));
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:89');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './user_data/songs/' + req.query.userId + '/');
    },
    filename: function (req, file, cb) {
        file.songId = uuid.v1();
        console.log(file.originalname);
        var extArray = file.originalname.split('.');
        cb(null, file.songId + '.' + extArray[extArray.length - 1]);
    }
});
var upload = multer({ storage: storage }).single('file');
try {
    var server = app.listen(90, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Server on http: ', host, port);
    });
} catch (error) {
    console.log(error);
}
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', function (req, res, next) {
    console.log('req from ' + req.query.userId);
    var userFolder = 'user_data/songs/' + req.query.userId;
    var imageFolder = 'user_data/thumbs/' + req.query.userId;
    if (!fs.existsSync(userFolder)){
        fs.mkdirSync(userFolder);
    }
    if (!fs.existsSync(imageFolder)){
        fs.mkdirSync(imageFolder);
    }
    upload(req, res, () => {
        jsmediatags.read(req.file.destination + req.file.filename, {
            onSuccess: (tags) =>{
                var tags = tags.tags;
                
                if(tags.picture) {
                    
                    var base64String = "";
                    for (var i = 0; i < tags.picture.data.length; i++) {
                        base64String += String.fromCharCode(tags.picture.data[i]);
                    }
                    var imageUrl = imageFolder + '/' +req.file.filename + '.' +tags.picture.format.split('/')[1];
                    dataUrl = btoa(base64String);
                    
                    require("fs").writeFile('./'+imageUrl , dataUrl, 'base64',  (err)=> {
                       
                        tags.thumbUrl = '../../../' + imageUrl;
                        tags.songUrl = userFolder + '/' + req.file.filename;
                        tags.songId = req.file.filename.split('.')[0];
                        tags.originalName = req.file.originalname;
                        tags.size = req.file.size;
                        
                        res.json(tags);
                    });
                } else {
                    tags.songUrl = userFolder + '/' + req.file.filename;
                    tags.thumbUrl = '../../../resources/default-upload.png';
                    tags.songId = req.file.filename.split('.')[0];
                    tags.originalName = req.file.originalname;
                    tags.size = req.file.size;
                    res.json(tags);
                }
            },
            onError: (error)=> {
                res.json({message: error});
            }
        });
    })
});