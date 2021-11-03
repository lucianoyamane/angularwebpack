const ts = require('typescript');
const path = require('path');
const helpers = require('./helpers');

const APP_COMMON_CONFIG = require('./config.common.json');

const DEFAULT_METADATA = {
  title: APP_COMMON_CONFIG.title,
  description: APP_COMMON_CONFIG.description,
  baseUrl: './',
  isDevServer: helpers.isWebpackDevServer(),
  WATCH: helpers.hasProcessFlag('watch'),
  tsConfigPath: 'tsconfig.webpack.json',
  isProduction: function() {
    return this.env && this.env == 'production';
  }
};

function supportES2015() {
  if (!supportES2015.hasOwnProperty('supportES2015')) {
    const tsTarget = readTsConfig(DEFAULT_METADATA.tsConfigPath).options.target;
    supportES2015['supportES2015'] = tsTarget !== ts.ScriptTarget.ES3 && tsTarget !== ts.ScriptTarget.ES5;
  }
  return supportES2015['supportES2015'];
}

function readTsConfig(tsConfigPath) {
  const configResult = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
  return ts.parseJsonConfigFileContent(configResult.config, ts.sys,
    path.dirname(tsConfigPath), undefined, tsConfigPath);
}

/**
 * Read the tsconfig to determine if we should prefer ES2015 modules.
 * Load rxjs path aliases.
 * https://github.com/ReactiveX/rxjs/blob/master/doc/lettable-operators.md#build-and-treeshaking
 * @param supportES2015 Set to true when the output of typescript is >= ES6
 */
function rxjsAlias(supportES2015) {
  try {
    const rxjsPathMappingImport = supportES2015 ? 'rxjs/_esm2015/path-mapping' : 'rxjs/_esm5/path-mapping';
    const rxPaths = require(rxjsPathMappingImport);
    return rxPaths(helpers.root('node_modules'));
  } catch (e) {
    return {};
  }
}

function ngcWebpackSetup(metadata, entry) {
  if (!metadata) {
    metadata = DEFAULT_METADATA;
  }

  const ngcWebpackPluginOptions = {
    tsConfigPath: metadata.tsConfigPath,
    mainPath: entry.main,
    skipCodeGeneration: false
  };

  if (!metadata.isProduction() && metadata.WATCH) {
    // Force commonjs module format for TS on dev watch builds.
    ngcWebpackPluginOptions.compilerOptions = {
      module: 'commonjs'
    };
  }
  const buildOptimizerLoader = {
    loader: '@angular-devkit/build-optimizer/webpack-loader',
    options: {
      sourceMap: true
    }
  };

  const loaders = [
    {
      test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
      use: [  buildOptimizerLoader, '@ngtools/webpack'  ]
    },
    ...[{ test: /\.js$/, use: [ buildOptimizerLoader ] }]
  ];

  return {
    loaders,
    plugin: ngcWebpackPluginOptions
  };
}

function updateMetadata(metadata) {
  return Object.assign({}, DEFAULT_METADATA, metadata)
}


exports.DEFAULT_METADATA = DEFAULT_METADATA;
exports.supportES2015 = supportES2015;
exports.readTsConfig = readTsConfig;
exports.rxjsAlias = rxjsAlias;
exports.ngcWebpackSetup = ngcWebpackSetup;
exports.updateMetadata = updateMetadata;
