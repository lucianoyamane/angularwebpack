/**
 * @author: tipe.io
 */
const helpers = require('./helpers');
const parametrosWebPack = helpers.parametrosWebPack();
const buildUtilsJIT = require('./build-utils');
const buildUtilsAOT = require('./build-utils.aot');
const buildUtils = parametrosWebPack.build.mode == "aot"?buildUtilsAOT:buildUtilsJIT;

/**
 * Used to merge webpack configs
*/
const webpackMerge = require('webpack-merge');
/**
 * The settings that are common to prod and dev
*/
const commonConfig = require('./webpack.common.js');

/**
 * Webpack Plugins
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HashedModuleIdsPlugin = require('webpack/lib/HashedModuleIdsPlugin')
const TerserPlugin = require('terser-webpack-plugin');



function getUglifyOptions (supportES2015) {
  const uglifyCompressOptions = {
    pure_getters: true, /* buildOptimizer */
    // PURE comments work best with 3 passes.
    // See https://github.com/webpack/webpack/issues/2899#issuecomment-317425926.
    passes: 2         /* buildOptimizer */
  };

  return {
    ecma: supportES2015 ? 6 : 5,
    warnings: false,    // TODO verbose based on option?
    ie8: false,
    mangle: true,
    compress: uglifyCompressOptions,
    output: {
      ascii_only: true,
      comments: false
    }
  };
}

module.exports = function () {
  console.log('webpack.prod')
  const supportES2015 = buildUtils.supportES2015();
  const METADATA = buildUtils.updateMetadata({
    env: 'production'
  });

  return webpackMerge(commonConfig(METADATA), {
    mode: 'production',

    /**
     * Options affecting the output of the compilation.
     *
     * See: https://webpack.js.org/configuration/output/
     */
    output: {

      /**
       * The output directory as absolute path (required).
       *
       * See: https://webpack.js.org/configuration/output/#output-path
       */
      path: helpers.root('../docs'),

      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: https://webpack.js.org/configuration/output/#output-filename
       */
      filename: '[name].[chunkhash].bundle.js',

      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: https://webpack.js.org/configuration/output/#output-chunkfilename
       */
      chunkFilename: '[name].[chunkhash].chunk.js'

    },

    module: {

      rules: [

        /**
         * Extract CSS files from .src/styles directory to external CSS file
         */
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
          include: [helpers.root('src', 'styles')]
        },

        /**
         * Extract and compile SCSS files from .src/styles directory to external CSS file
         */
        {
          test: /\.scss$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
          include: [helpers.root('src', 'styles')]
        },

      ]

    },

    optimization: {
      minimizer: [
        /**
         * Plugin: UglifyJsPlugin
         * Description: Minimize all JavaScript output of chunks.
         * Loaders are switched into minimizing mode.
         *
         * See: https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
         *
         * NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
         */
         new TerserPlugin({
          parallel: true,
          cache: true,
          terserOptions: getUglifyOptions(supportES2015, true)
        }),
      ],
      splitChunks: {
        chunks: 'all'
      }
    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: https://webpack.js.org/configuration/plugins/
     */
    plugins: [

      new MiniCssExtractPlugin({ filename: '[name]-[hash].css', chunkFilename: '[name]-[chunkhash].css' }),

      new HashedModuleIdsPlugin(),

    ],

    /**
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.js.org/configuration/node/
     */
    node: {
      global: true,
      crypto: 'empty',
      process: false,
      module: false,
      clearImmediate: false,
      setImmediate: false,
      fs: 'empty'
    }

  });
};
