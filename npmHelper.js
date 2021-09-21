var spawn = require('child_process').spawn;

function spawnNpmInstall(args = []) {
  return new Promise((resolve) => {
    var child = spawn('npm', ['install', ...(args || [])], {
      cwd: process.cwd(),
      env: process.env,
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        //Here is where the output goes
  
        data=data.toString();
        process.stdout.write(data);
    });
  
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        //Here is where the error output goes
        data=data.toString();
        process.stderr.write(data);
    });
  
    child.on('close', function(code) {
        //Here you can get the exit code of the script
        console.log('DONE!');
        resolve();
    });
  });
}

module.exports = {
  spawnNpmInstall,
}