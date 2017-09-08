/**
 * Created by appian on 2017/9/8.
 */
var http = require('http');
var process = require('child_process');
var createHandler = require('github-webhook-handler');
var webhookHandler = createHandler({path: '/webhook', secret: 'appian'});
/*

 function run_cmd(cmd, args, callback) {
 var spawn = require('child_process').spawn;
 var child = spawn(cmd, args);
 var resp = "";

 child.stdout.on('data', function(buffer) { resp += buffer.toString(); });
 child.stdout.on('end', function() { callback (resp) });
 }
 */

function webhook_cmd(cwd, callback) {
  process.exec('git pull', {'cwd': cwd}, function (error, stdout, stderr) {
    console.log('stdout========================\n' + stdout);
    console.log('stderr========================\n' + stderr);
    if (error !== null) {
      console.log('this error in webhook_cmd', error);
    } else {
      console.log('this ok in webhook_cmd');
      callback && callback();
    }
  });
}


http.createServer(function (req, res) {
  webhookHandler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(3001);

webhookHandler.on('error', function (err) {
  console.error('Error:', err.message)
})

webhookHandler.on('push', function (event) {
  console.log('-------3push ↓↓↓↓');
  console.log(event);
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);
  webhook_cmd('/home/appian/web/Close2Webhook', function () {
    process.exec('pm2 restart 1', function (error, stdout, stderr) {
      if (error) {
        console.log('this error in' + event.payload.repository.name, error);
      } else {
        console.log('pm2 执行成功-3');
      }
    });
  });
})
