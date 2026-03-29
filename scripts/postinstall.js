const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Patch firmata's com.js to work with serialport v12 API
// serialport v9: require('serialport') returns SerialPort class, constructor is (path, options)
// serialport v12: require('serialport') returns { SerialPort }, constructor is ({ path, ...options })
const comPath = path.join(__dirname, '..', 'node_modules', 'firmata', 'lib', 'com.js');
if (fs.existsSync(comPath)) {
  const patchedCom = `"use strict";

const Emitter = require("events");

function Mock(path, options, openCallback) {
  this.isOpen = true;
  this.baudRate = 0;
  this.path = path;
}

Mock.prototype = Object.create(Emitter.prototype, {
  constructor: { value: Mock }
});

Mock.prototype.write = function (buffer) {
  if (Buffer.isBuffer(buffer)) {
    buffer = Array.from(buffer);
  }
  this.lastWrite = buffer;
  this.emit("write", buffer);
};

let com;
let stub = {
  SerialPort: Mock,
  list() { return Promise.resolve([]); },
};

try {
  if (process.browser || parseFloat(process.versions.nw) >= 0.13) {
    com = require("browser-serialport");
  } else if (process.env.IS_TEST_MODE) {
    com = stub;
  } else {
    // serialport v12: named export { SerialPort }, constructor takes ({ path, ...options })
    const { SerialPort } = require("serialport");

    // Compatibility wrapper: firmata calls new com.SerialPort(path, options)
    // but serialport v12 expects new SerialPort({ path, ...options })
    function SerialPortCompat(portPath, options, openCallback) {
      const opts = Object.assign({}, options, { path: portPath });
      return new SerialPort(opts, openCallback);
    }

    com = {
      SerialPort: SerialPortCompat,
      list: SerialPort.list.bind(SerialPort),
    };
  }
} catch (err) {}

if (com == null) {
  if (process.env.IS_TEST_MODE) {
    com = stub;
  } else {
    console.log("It looks like serialport didn't compile properly.");
    throw "Missing serialport dependency";
  }
}

module.exports = com;
`;
  fs.writeFileSync(comPath, patchedCom);
  console.log('Patched firmata/lib/com.js for serialport v12 compatibility');
}

// Patch johnny-five's board.js: serialport v12 uses named export
// johnny-five does: serialport = require("serialport"); serialport.list()
// but v12 exports { SerialPort } so we need serialport.SerialPort.list()
const boardPath = path.join(__dirname, '..', 'node_modules', 'johnny-five', 'lib', 'board.js');
if (fs.existsSync(boardPath)) {
  let boardSrc = fs.readFileSync(boardPath, 'utf8');
  const oldLine = 'serialport = require("serialport");';
  const newLine = 'serialport = require("serialport"); if (serialport.SerialPort) { const _SP = serialport.SerialPort; serialport = { list: _SP.list.bind(_SP) }; }';
  if (boardSrc.includes(oldLine) && !boardSrc.includes('serialport.SerialPort')) {
    boardSrc = boardSrc.replace(oldLine, newLine);
    fs.writeFileSync(boardPath, boardSrc);
    console.log('Patched johnny-five/lib/board.js for serialport v12 compatibility');
  }
}

// Install Electron binary if not present
try {
  require('electron');
} catch (e) {
  console.log('Installing Electron binary...');
  execSync('node ' + path.join(__dirname, '..', 'node_modules', 'electron', 'install.js'), { stdio: 'inherit' });
}

// Rebuild native modules for Electron
console.log('Rebuilding native modules for Electron...');
execSync('npx @electron/rebuild', { stdio: 'inherit' });
