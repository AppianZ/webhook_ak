/**
 * Created by appian on 2017/9/8.
 */
var http = require('http');
var process = require('child_process');
var createHandler = require('github-webhook-handler');
var webhookHandler = createHandler({path: '/webhook', secret: 'appian'});
var multiHandler = createHandler({path: '/multi', secret: 'appian'});
// var nodeHandler = createHandler({path: '/node', secret: 'appian'});

function run_cmd(cmd, args, callback) {
  var spawn = require('child_process').spawn;
  var child = spawn(cmd, args);
  var resp = "";
  child.stdout.on('data', function (buffer) {
    resp += buffer.toString();
  });
  child.stdout.on('end', function () {
    callback(resp);
  });
}

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
    res.end('no such webhookHandler location');
  })
  multiHandler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such multiHandler location');
  })
}).listen(3001);

webhookHandler.on('error', function (err) {
  console.error('Error:', err.message)
})

multiHandler.on('error', function (err) {
  console.error('Error:', err.message)
})

/*nodeHandler.on('error', function (err) {
  console.error('Error:', err.message)
})*/

webhookHandler.on('push', function (event) {
  // run_cmd('sh', ['./deploy.sh',event.payload.repository.name], function(text){ console.log(text) });
  webhook_cmd('/home/appian/web/Close2Webhook', function () {
    process.exec('pm2 restart 1', function (error, stdout, stderr) {
      if (error) console.log('this error in' + event.payload.repository.name, error);
      else console.log('/webhook 的 pm2 重启成功');
    });
  });
  console.log('---- /webhook --- push ok');
})

multiHandler.on('push', function (event) {
  webhook_cmd('/home/appian/web/Close2Multi', function () {
    process.exec('npm run dev', function (error, stdout, stderr) {
      if (error) console.log('this error in' + event.payload.repository.name, error);
      else console.log('/multi 的 build 成功');
    });
  });
  console.log('---- /multi --- push ok');
})


/*nodeHandler.on('push', function (event) {
  // run_cmd('sh', ['./deploy.sh',event.payload.repository.name], function(text){ console.log(text) });
  webhook_cmd('/home/appian/web/Close2Node', function () {
    process.exec('pm2 restart 1', function (error, stdout, stderr) {
      if (error) console.log('this error in' + event.payload.repository.name, error);
      else console.log('/node 的 pm2 重启成功');
    });
  });
  console.log('---- /node --- push ok');
})*/
