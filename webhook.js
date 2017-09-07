var express = require('express');
var bodyParser = require('body-parser');
var process = require('child_process');
var ejs = require('ejs');
var app = express();
app.engine('html', ejs.__express);
app.set('view engine', 'html');
app.set('views', __dirname);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.send('appian close2webhook default get');
});

app.post('/webhook', function (req, res) {
  webhook(req, res, 'appian', '/home/appian/web/Close2Webhook', function () {
    process.exec('pm2 restart 1', function (error, stdout, stderr) {
      if (error) {
        res.send('<pre>fail!!!\n' + error + '</pre>');
      } else {
        console.log('pm2 执行成11122211功');
      }
    });
  });
});

app.post('/multi', function (req, res) {
  webhook(req, res, 'multi', '/home/appian/web/Close2Multi',function() {
    process.exec('npm run build && npm run restart', { 'cwd': '/home/appian/web/Close2Multi' }, function (error, stdout, stderr) {
      if (error) {
        res.send('<pre>fail!!!\n' + error + '</pre>');
      } else {
        console.log('npm run restart 执行成功 /multi');
      }
    });

  });
});

function webhook(req, res, token, cwd, callback) {
  console.log(' token: ', token);
  console.log(' req.body.token: ', req.body);
  if (token === req.body['token']) {
    process.exec('git pull', { 'cwd': cwd }, function (error, stdout, stderr) {
      console.log('stdout========================\n' + stdout);
      console.log('stderr========================\n' + stderr);
      if (error !== null) {
        res.send('<pre>fail!!!\n' + stdout + error + '</pre>');
      } else {
        res.send('<pre>done!!!\n' + stdout + '</pre>');
        callback && callback()
      }
    });
  } else {
    console.log(' failed token ');
    res.send('<pre>token不正确?</pre>');
  }
}

app.set('port', 3001);

var server = app.listen(3001, function () {
  console.log('appian webhook listening on port %d', server.address().port);
})