import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const configPath = fileURLToPath(new URL('./config.json', import.meta.url));
let settings;
try {
  // Accept the UTF-8 BOM that some Windows text editors add.
  settings = JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, ''));
} catch (error) {
  throw new Error(`Cannot read ${configPath}. Use valid JSON, for example {"port": 4173}. ${error.message}`);
}
if (!settings || !Number.isInteger(settings.port) || settings.port < 1 || settings.port > 65535) {
  throw new Error(`Invalid port in ${configPath}. Set "port" to an integer from 1 to 65535.`);
}

const host = '127.0.0.1';
export const config = Object.freeze({host, port: settings.port, baseUrl: `http://${host}:${settings.port}`});

// The Windows launcher uses the same loader and validation as the server and importer.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(config.baseUrl);
}
