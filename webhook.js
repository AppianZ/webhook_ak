var process = require('child_process');
var http = require('http');
var createHandler = require('node-github-webhook');
var handler = createHandler([{
  path: '/webhook',
  secret: 'appian',
}, {
  path: '/multi',
  secret: 'appian',
}, {
  path: '/express',
  secret: 'appian',
}])

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.json(req);
    res.json(res);
  })
}).listen(3006)

console.log('~~~~~~~~ port: 3006!! ~~~~~~~')

function webhook_cmd(cwd, callback, branch) {
  process.exec('git pull origin ' + branch, {'cwd': cwd, 'shell': '/bin/sh'}, function (error, stdout, stderr) {
    console.log('stdout=====\n' + cwd);
    console.log('stdout=====\n' + stdout);
    console.log('stderr=====\n' + stderr);
    if (error !== null) {
      console.log('this error in webhook_cmd', error);
    } else {
      console.log('this ok in webhook_cmd, then start callback');
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
  var branch = event.payload.ref.replace('refs/heads/', '')
  console.log('分支名字:  ', branch);
  var execList = {
    'master' : {
      name: 'prod',
      command: 'npm run build',
    },
    'aws' : {
      name: 'prod',
      command: 'npm run build:aws'
    },
    'test' : {
      name: 'test',
      command: 'npm run build:test'
    },
  }
  switch (path) {
    case '/webhook':
      webhook_cmd('/home/appian/web/webhook_ak', function () {
        process.exec('pm2 restart appian.webhook', function (error, stdout, stderr) {
          if (error) console.log('this error in' + event.payload.repository.name, error);
          else console.log('/webhook 的 pm2 重启成功');
        });
      }, 'master');
      console.log('---- /webhook --- push case');
      break
    case '/multi':
      webhook_cmd('/home/appian/workspace/' + execList[branch].name + '_multi_ak', function () {
        process.exec(execList[branch].command, {cwd : '/home/appian/workspace/' + execList[branch].name + '_multi_ak'}, function (error, stdout, stderr) {
          console.log('+++++', stdout);
          if (error) console.log('this error in' + event.payload.repository.name, error);
          else console.log('/multi 执行 ' + execList[branch].command + ' 成功');
        });
      }, branch);
      console.log('---- /multi --- push case');
      break
    case '/express':
      webhook_cmd('/home/appian/web/node_ak', function () {
        process.exec('npm run restart:' + branch, {cwd : '/home/appian/web/node_ak'}, function (error, stdout, stderr) {
          console.log('+++++', stdout);
          if (error) console.log('this error in' + event.payload.repository.name, error);
          else console.log('/multi 执行 ' + 'npm run restart:' + branch + ' 成功');
        });
        console.log('/node 执行成功');
      }, branch);
      console.log('---- /node --- push case');
      break
    default:
      break
  }
})

