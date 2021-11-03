/**
 * @author: tipe.io
 */
const path = require('path');
var readYaml = require('read-yaml');
var configWebPack = readYaml.sync('./config/parametros.webpack.yml');

const EVENT = process.env.npm_lifecycle_event || '';

/**
 * Helper functions.
 */
var ROOT = path.resolve(__dirname, '..');

function hasProcessFlag(flag) {
  return process.argv.join('').indexOf(flag) > -1;
}

function hasNpmFlag(flag) {
  return EVENT.includes(flag);
}

function isWebpackDevServer() {
  return process.argv[1] && !! (/webpack-dev-server/.exec(process.argv[1]));
}

function parametrosWebPack() {
  console.log(configWebPack)
  return configWebPack;
}

var root = path.join.bind(path, ROOT);

exports.hasProcessFlag = hasProcessFlag;
exports.hasNpmFlag = hasNpmFlag;
exports.isWebpackDevServer = isWebpackDevServer;
exports.root = root;
exports.parametrosWebPack = parametrosWebPack;
