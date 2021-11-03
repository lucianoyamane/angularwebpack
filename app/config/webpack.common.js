/**
 * @author: tipe.io
 */

const helpers = require('./helpers');

/**
 * Webpack Plugins
 *
 * problem with copy-webpack-plugin
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlElementsPlugin = require('./html-elements-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackInlineManifestPlugin = require('webpack-inline-manifest-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

const parametrosWebPack = helpers.parametrosWebPack();
const buildUtilsJIT = require('./build-utils');
const buildUtilsAOT = require('./build-utils.aot');
const buildUtils = parametrosWebPack.build.mode == "aot"?buildUtilsAOT:buildUtilsJIT;

/**
 * Webpack configuration
 *
 * See: https://webpack.js.org/configuration/
 */
module.exports = function (metadata) {
  if (!metadata) {
    throw new Error('metadata not exists(webpack.common)')
  }

  const entry = {
    polyfills: './src/polyfills.browser.ts',
    main:      './src/main.browser.ts'
  };

  const ngcWebpackConfig = buildUtils.ngcWebpackSetup(metadata, entry);
  const supportES2015 = buildUtils.supportES2015();

  return {
    /**
     * The entry point for the bundle
     * Our Angular.js app
     *
     * See: https://webpack.js.org/configuration/entry-context/#entry
     */
    entry: entry,

    /**
     * Options affecting the resolving of modules.
     *
     * See: https://webpack.js.org/configuration/resolve/
     */
    resolve: {
      mainFields: [ ...(supportES2015 ? ['es2015'] : []), 'browser', 'module', 'main' ],

      /**
       * An array of extensions that should be used to resolve modules.
       *
       * See: https://webpack.js.org/configuration/resolve/#resolve-extensions
       */
      extensions: ['.ts', '.js', '.json'],

      /**
       * An array of directory names to be resolved to the current directory
       */
      modules: [helpers.root('src'), helpers.root('node_modules')],

      /**
       * Add support for lettable operators.
       *
       * For existing codebase a refactor is required.
       * All rxjs operator imports (e.g. `import 'rxjs/add/operator/map'` or `import { map } from `rxjs/operator/map'`
       * must change to `import { map } from 'rxjs/operators'` (note that all operators are now under that import.
       * Additionally some operators have changed to to JS keyword constraints (do => tap, catch => catchError)
       *
       * Remember to use the `pipe()` method to chain operators, this functinoally makes lettable operators similar to
       * the old operators usage paradigm.
       *
       * For more details see:
       * https://github.com/ReactiveX/rxjs/blob/master/doc/lettable-operators.md#build-and-treeshaking
       *
       * If you are not planning on refactoring your codebase (or not planning on using imports from `rxjs/operators`
       * comment out this line.
       *
       * BE AWARE that not using lettable operators will probably result in significant payload added to your bundle.
       */
      alias: buildUtils.rxjsAlias(supportES2015)
    },

    /**
     * Options affecting the normal modules.
     *
     * See: https://webpack.js.org/configuration/module/
     */
    module: {

      rules: [
        ...ngcWebpackConfig.loaders,

	      { test: /\.yml$/,  loader: 'json-loader!yaml-loader' },

        /**
         * To string and css loader support for *.css files (from Angular components)
         * Returns file content as string
         *
         */
        {
          test: /\.css$/,
          use: ['to-string-loader', 'css-loader'],
          exclude: [helpers.root('src', 'styles')]
        },

        /**
         * To string and sass loader support for *.scss files (from Angular components)
         * Returns compiled css content as string
         *
         */
        {
          test: /\.scss$/,
          use: ['to-string-loader', 'css-loader', 'sass-loader'],
          exclude: [helpers.root('src', 'styles')]
        },

        /**
         * Raw loader support for *.html
         * Returns file content as string
         *
         * See: https://github.com/webpack/raw-loader
         */
        {
          test: /\.html$/,
          use: 'raw-loader',
          exclude: [helpers.root('src/index.html')]
        },

        /**
         * File loader for supporting images, for example, in CSS files.
         */
        {
          test: /\.(jpg|png|gif)$/,
          use: 'file-loader'
        },

        /* File loader for supporting fonts, for example, in CSS files.
        */
        {
          test: /\.(eot|woff2?|svg|ttf)([\?]?.*)$/,
          use: 'file-loader'
        }

      ],

    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: https://webpack.js.org/configuration/plugins/
     */
    plugins: [
      new DefinePlugin({ 
        ENV: JSON.stringify(metadata.env),
        IS_PRODUCTION: metadata.env == 'production',
        ngDevMode: !metadata.env == 'production',  
      }),
      /**
       * Plugin: CopyWebpackPlugin
       * Description: Copy files and directories in webpack.
       *
       * Copies project static assets.
       *
       * See: https://www.npmjs.com/package/copy-webpack-plugin
       */
      new CopyWebpackPlugin([
        { from: 'src/assets', to: 'assets' }
      ]),

      /*
      * Plugin: HtmlWebpackPlugin
      * Description: Simplifies creation of HTML files to serve your webpack bundles.
      * This is especially useful for webpack bundles that include a hash in the filename
      * which changes every compilation.
      *
      * See: https://github.com/ampedandwired/html-webpack-plugin
      */
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        title: metadata.title,
        chunksSortMode: function (a, b) {
          const entryPoints = ["inline","polyfills","sw-register","styles","vendor","main"];
          return entryPoints.indexOf(a.names[0]) - entryPoints.indexOf(b.names[0]);
        },
        metadata: metadata,
        inject: 'body',
        xhtml: true,
        minify: metadata.isProduction() ? {
          caseSensitive: true,
          collapseWhitespace: true,
          keepClosingSlash: true
        } : false
      }),

       /**
       * Plugin: ScriptExtHtmlWebpackPlugin
       * Description: Enhances html-webpack-plugin functionality
       * with different deployment options for your scripts including:
       *
       * See: https://github.com/numical/script-ext-html-webpack-plugin
       */
      new ScriptExtHtmlWebpackPlugin({
        sync: /inline|polyfills|vendor/,
        defaultAttribute: 'async',
        preload: [/polyfills|vendor|main/],
        prefetch: [/chunk/]
      }),

      new HtmlElementsPlugin({
        headTags: require('./head-config.common')
      }),

      new AngularCompilerPlugin(ngcWebpackConfig.plugin),
      new WebpackInlineManifestPlugin()
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
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }

  };
};
