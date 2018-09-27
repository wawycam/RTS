import { spawn } from 'child_process';
import config from './config';

export default (camera, filePath, cb) => {
  const endpoint = `${config.uri}/upload`;
  const args = [
    '-v',
    '-k',
    '-o logfile',
    '-#',
    '-i',
    '-H',
    'Content-Type: multipart/form-data',
    '-F',
    `camera=${camera}`,
    '-F',
    `file=@${filePath}`,
    endpoint,
  ];
  const child = spawn('curl', args);
  // +'/'+idride

  child.stdout.setEncoding('utf8');
  child.stdin.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  child.stderr.on('data', (chunk) => {
    let progress = chunk.replace(/#/g, '');
    progress = progress.replace(/%/g, '');
    progress = progress.replace(/ /g, '');
    progress = parseInt(progress, 10);
    if (progress > 0 && !Number.isNaN(progress)) {
      cb(progress);
    }
  });

  child.on('close', () => {
    cb('uploaded');
  });
};
