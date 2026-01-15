const { Client } = require('ssh2');

const config = { host: '213.142.148.35', port: 22, username: 'root', password: 'Nodir1998' };
const conn = new Client();
conn.on('ready', () => {
    conn.exec('tail -n 100 /root/.pm2/logs/sushi-server-error.log', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => conn.end()).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
    });
}).connect(config);
