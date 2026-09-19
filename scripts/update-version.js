/* eslint-disable */
const fs = require('fs');
const runNumber = process.argv[2];
const version = `6.3.${runNumber}`;

// tauri.conf.json
const tauriConfPath = 'src-tauri/tauri.conf.json';
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
tauriConf.version = version;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2));

// package.json
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// Cargo.toml
const cargoPath = 'src-tauri/Cargo.toml';
let cargo = fs.readFileSync(cargoPath, 'utf8');
cargo = cargo.replace(/version\s*=\s*"[^"]+"/, `version = "${version}"`);
fs.writeFileSync(cargoPath, cargo);

console.log(`Updated versions to ${version}`);
