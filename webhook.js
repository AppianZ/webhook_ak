/**
 * Created by appian on 2017/9/8.
 */
var http = require('http');
var createHandler = require('github-webhook-handler');
var webhookHandler = createHandler({ path: '/webhook', secret: 'appian' });

function run_cmd(cmd, args, callback) {
  var spawn = require('child_process').spawn;
  var child = spawn(cmd, args);
  var resp = "";

  child.stdout.on('data', function(buffer) { resp += buffer.toString(); });
  child.stdout.on('end', function() { callback (resp) });
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
  console.log('-------push ↓↓↓↓');
  console.log(event);
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);
  run_cmd('sh', ['./deploy.sh', event.payload.repository.name], function(text){ console.log(text) });
})
