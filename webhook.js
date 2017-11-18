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
  path: '/spa',
  secret: 'appian',
}, {
  path: '/express',
  secret: 'appian',
}, {
  path: '/node',
  secret: 'appian',
}, {
  path: '/react',
  secret: 'appian',
}, {
  path: '/reactnode',
  secret: 'appian',
}])

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.json(req);
    res.json(res);
  })
}).listen(3006)

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
  console.log('the BRANCH updating:  ', branch);
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
          if (error) console.log('this error in webhook : ' + event.payload.repository.name, error);
          else console.log('/webhook pm2 restart success');
        });
      }, 'master');
      break
    case '/multi':
      webhook_cmd('/home/appian/workspace/' + execList[branch].name + '_multi_ak', function () {
        process.exec(execList[branch].command, {cwd : '/home/appian/workspace/' + execList[branch].name + '_multi_ak'}, function (error, stdout, stderr) {
          if (error) console.log('this error in multi --- ' + execList[branch].command + ' : ' + event.payload.repository.name, error);
          else {
            process.exec('rm -rf public && \cp -rf ./../' + execList[branch].name + '_multi_ak/public ./ && npm run restart:' + execList[branch].name, {cwd : '/home/appian/workspace/' + execList[branch].name + '_node_ak'}, function () {
              if (error) console.log('this error multi --- cp : ' + event.payload.repository.name, error);
              else console.log('---- /multi : ' + execList[branch].name + '_multi_ak ---- ' + execList[branch].command + ' ---- push case ---- ');
            })
          }
        });
      }, branch);
      break
    case '/spa':
      webhook_cmd('/home/appian/workspace/' + execList[branch].name + '_spa_ak', function () {
        process.exec(execList[branch].command, {cwd : '/home/appian/workspace/' + execList[branch].name + '_spa_ak'}, function (error, stdout, stderr) {
          if (error) console.log('this error in spa --- ' + execList[branch].command + ' : ' + event.payload.repository.name, error);
          else {
            process.exec('rm -rf public && \cp -rf ./../' + execList[branch].name + '_spa_ak/dist ./public && npm run restart:' + execList[branch].name, {cwd : '/home/appian/workspace/' + execList[branch].name + '_node_spa_ak'}, function () {
              if (error) console.log('this error spa --- cp : ' + event.payload.repository.name, error);
              else console.log('---- /spa : ' + execList[branch].name + '_spa_ak ---- ' + execList[branch].command + ' ---- push case ---- ');
            })
          }
        });
      }, branch);
      break
    case '/express':
      webhook_cmd('/home/appian/workspace/' + execList[branch].name + '_node_ak', function () {
        process.exec('rm -rf dist && gulp build', {cwd: '/home/appian/workspace/' + execList[branch].name + '_node_ak'}, function (error, stdout, stderr) {
          if (error) console.log('this error in express --- gulp build : ' + event.payload.repository.name, error);
          else {
            process.exec('npm run restart:' + execList[branch].name, {cwd: '/home/appian/workspace/' + execList[branch].name + '_node_ak'}, function (error, stdout, stderr) {
              if (error) console.log('this error in express --- npm run restart:' + execList[branch].name + ' : ' + event.payload.repository.name, error);
              else console.log('---- /express : ' + execList[branch].name + '_node_ak ---- gulp build & npm run restart:' + execList[branch].name + ' ---- push case ---- ');
            });
          }
        });
      }, branch);
      break
    case '/node':
      webhook_cmd('/home/appian/workspace/' + execList[branch].name + '_node_spa_ak', function () {
        process.exec('rm -rf dist && gulp build', {cwd: '/home/appian/workspace/' + execList[branch].name + '_node_spa_ak'}, function (error, stdout, stderr) {
          if (error) console.log('this error in node --- gulp build : ' + event.payload.repository.name, error);
          else {
            process.exec('npm run restart:' + execList[branch].name, {cwd: '/home/appian/workspace/' + execList[branch].name + '_node_spa_ak'}, function (error, stdout, stderr) {
              if (error) console.log('this error in node --- npm run restart:' + execList[branch].name + ' : ' + event.payload.repository.name, error);
              else console.log('---- /node : ' + execList[branch].name + '_node_spa_ak ---- gulp build & npm run restart:' + execList[branch].name + ' ---- push case ---- ');
            });
          }
        });
      }, branch);
      break
    case '/react':
      webhook_cmd('/home/appian/workspace/react_ak', function () {
        process.exec('rm -rf dist && npm run build', {cwd: '/home/appian/workspace/react_ak'}, function (error, stdout, stderr) {
          if (error) console.log('this error in react --- npm run build : ' + event.payload.repository.name, error);
          else {
            console.log('---- /react : react_ak ---- npm run build ---- push case ---- ');
          }
        });
      }, branch);
      break
    case '/reactnode':
      webhook_cmd('/home/appian/workspace/react_node_ak', function () {
        process.exec('rm -rf dist && gulp build', {cwd: '/home/appian/workspace/react_node_ak'}, function (error, stdout, stderr) {
          if (error) console.log('this error in node --- gulp build : ' + event.payload.repository.name, error);
          else {
            console.log('---- /node : react_node_ak ---- gulp build & npm run restart:prod ---- push case ---- ');
          }
        });
      }, branch);
      break
    default:
      break
  }
})

