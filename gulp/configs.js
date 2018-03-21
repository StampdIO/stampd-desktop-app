/**
 * Gulp configs
 *
 * @version 1.0.0
 * @author Hypermetron (Minas Antonios)
 * @copyright Copyright (c) 2016, Minas Antonios
 * @license http://opensource.org/licenses/gpl-2.0.php GPL v2 or later
 */

'use strict';

var configs = {

  // themeSlug: 'hpmtheme', // todo: change theme slug

  // base paths saved for reusability
  basePaths: {
    src: './assets/src/',
    dest: './assets/',
    // plugins: 'D:\\wamp64\\www\\hpmtheme\\wp-content\\plugins\\', // todo: change to relative path somehow
    // theme: 'D:\\wamp64\\www\\hpmtheme\\wp-content\\themes\\',
  },

  tasks: {

    // singleJSFile: {
    //     // Single JS files
    //     get src() {
    //         return [configs.basePaths.src + 'js/**/*.js', '!' + configs.basePaths.src + 'js/**/_*', '!' + configs.tasks.js.entries];
    //     },
    //     // destination folder where the scripts will
    //     // be output
    //     get dest() {
    //         return configs.basePaths.dest + 'js';
    //     },
    //     // the following files will be watched for changes
    //     get watch() {
    //         return configs.tasks.singleJSFile.src;
    //     },
    // },

    js: {
        // first file to be required in order to create
        // the bundle
        get entries() {
            return configs.basePaths.src + 'js/index.js';
        },
        // JS source files
        get src() {
            return configs.basePaths.src + 'js/**/*.js';
        },
        // destination folder where the scripts will
        // be output
        get dest() {
            return configs.basePaths.dest + 'js';
        },
        // filename of bundled file
        filename: 'scripts.js',
        // the following files will be watched for changes
        get watch() {
            //return configs.tasks.js.dest + '/' + configs.tasks.js.filename;
            return [configs.basePaths.src + 'js/**/index.js', configs.basePaths.src + 'js/**/_*.js'];
        },
        // BrowserSync will watch the following files
        get browserSync() {
            return configs.tasks.js.dest + '/' + configs.tasks.js.filename;
        }
    },

    sass: {
      // SASS source files except those that start with
      // underscore
      get src() {
        return [configs.basePaths.src + 'scss/**/*.scss', '!' + configs.basePaths.src + 'scss/**/_*'];
      },
      // destination folder where the compiled CSS
      // files will be output
      get dest() {
        return configs.basePaths.dest + 'css';
      },
      // the following files will be watched for changes
      get watch() {
        return configs.basePaths.src + 'scss/**/*.scss';
      },
      // BrowserSync will watch the following files
      get browserSync() {
        return configs.basePaths.dest + 'css/**/*.css';
      }
    },

    // fonts: {
    //   // Font source files except those that start with
    //   // underscore
    //   get src() {
    //     return [configs.basePaths.src + 'fonts/**/*.{ttf,otf}'];
    //   },
    //   // destination folder where the compiled CSS
    //   // files will be output
    //   get dest() {
    //     return configs.basePaths.dest + 'fonts';
    //   },
    //   // the following files will be watched for changes
    //   get watch() {
    //     return configs.basePaths.src + 'fonts/**/*.{ttf,otf}';
    //   },
    // },

    // img: {
    //     // Image source files except those that start with
    //     // underscore
    //     get src() {
    //         return configs.basePaths.src + 'img/**/*';
    //     },
    //     // destination folder where the compiled image
    //     // files will be output
    //     get dest() {
    //         return configs.basePaths.dest + 'img';
    //     },
    //     // the following files will be watched for changes
    //     get watch() {
    //         return configs.basePaths.src + 'img/**/*';
    //     }
    // },

  }

};

module.exports = configs;