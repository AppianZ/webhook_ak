var express = require('express');
var bodyParser = require('body-parser');
var process = require('child_process');
var ejs = require('ejs');
var app = express();
app.engine('html', ejs.__express);
app.set('view engine', 'html');
app.set('views', __dirname);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.render('default');
});


app.post('/webhook', function (req, res) {
  webhook(req, res, 'xxx', '/home/www/fy-webhook');
});

app.post('/multi', function (req, res) {
  webhook(req, res, 'fyfemulti', '/home/www/fy_fe_mulit',function() {
    process.exec('npm run build && npm run restart', { 'cwd': '/home/www/fy_fe_mulit' }, function (error, stdout, stderr) {
      if (error) {
        res.send('<pre>fail!!!\n' + error + '</pre>');
      } else {
        console.log('npm run restart 执行成功');
      }
    });

  });
});

function webhook(req, res, token, cwd, callback) {
  if (token === req.body['token']) {

    // console.info(process);
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
    console.log(' failed token ')
    res.send('<pre>token不正确?</pre>');
  }
}


app.set('port', 3001);

var server = app.listen(3001, function () {
  console.log('Listening on port %d', server.address().port);
})