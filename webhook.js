/**
 * Created by appian on 2017/9/9.
 */
var process = require('child_process');
var http = require('http');
var createHandler = require('node-github-webhook');
var handler = createHandler([{
  path: '/webhook',
  secret: 'appian',
}, {
  path: '/multi',
  secret: 'appian',
}])

http.createServer(function (req, res) {
  res.send(req);
  res.send('------ req ↑ res ↓ ----');
  res.send(res);
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such appian location4');
  })
}).listen(3006)

function webhook_cmd(cwd, callback) {
  process.exec('git pull', {'cwd': cwd, 'shell': '/bin/sh'}, function (error, stdout, stderr) {
    console.log('stdout=====\n' + cwd);
    console.log('stdout=====\n' + stdout);
    console.log('stderr=====\n' + stderr);
    if (error !== null) {
      console.log('this error in webhook_cmd', error);
    } else {
      console.log('this ok in webhook_cmd');
      callback && callback();
    }
  });
}

// handler
handler.on('error', function (err) {
  console.error('Error:', err.message)
})
handler.on('push', function (event) {
  var path = event.path
  console.log('url#######', path);
  switch (path) {
    case '/webhook':
      webhook_cmd('/home/appian/web/webhook_ak', function () {
        process.exec('pm2 restart appian.webhook', function (error, stdout, stderr) {
          if (error) console.log('this error in' + event.payload.repository.name, error);
          else console.log('/webhook 的 pm2 重启成功');
        });
      });
      console.log('---- /webhook --- push case');
      break
    case '/multi':
      webhook_cmd('/home/appian/web/multi_ak', function () {
        process.exec('npm run build', {cwd : '/home/appian/web/multi_ak'}, function (error, stdout, stderr) {
          console.log('+++++', stdout);
          if (error) console.log('this error in' + event.payload.repository.name, error);
          else console.log('/multi 的 build 成功111');
        });
      });
      console.log('---- /multi --- push case');
      break
    default:
      break
  }
})

