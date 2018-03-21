/**
 * Gulp sass
 *
 * @version 1.0.0
 * @author Hypermetron (Minas Antonios)
 * @copyright Copyright (c) 2016, Minas Antonios
 * @license http://opensource.org/licenses/gpl-2.0.php GPL v2 or later
 */

'use strict';

/**
 * Required Plugins
 * ----------------
 */

var configs = require('../configs');
var gulp = require('gulp');
var sassPlugin = require('gulp-sass');
var notify = require('gulp-notify');
var autoprefixer = require('gulp-autoprefixer');
//var cssMin       = require('gulp-minify-css');
var csso = require('gulp-csso');
// var lineCorrector = require('gulp-line-ending-corrector');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var watch = require('gulp-watch');


/**
 * Task Definitions
 * ----------------
 */

var sass = function () {

  gulp.task('sass', ['sassMin', 'sassCompile'], function () {
    gulp.start('sassMin');
  });
};

var sassCompile = function () {

  /**
   * Compiles SASS files into CSS
   *
   * @src .scss files
   * @dest .css files from sass compilation
   */
  gulp.task('sassCompile', function () {
    gulp.src(configs.tasks.sass.src)
      .pipe(plumber({
        errorHandler: function (err) {
          console.log("SASS Plumber Error");
          console.log(err);
        }
      }))
      .pipe(sassPlugin().on('error', function (err) {
        console.log("SASS Error");
        console.log(err);
      }))
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
      // .pipe(lineCorrector()) // removed because it caused an error for Matt
      .pipe(gulp.dest(configs.tasks.sass.dest))
      .pipe(notify({
        message: "SASS Compiled",
        onLast: true
      }));
  });
};

var sassMin = function () {

  /**
   * Uglifies CSS files and adds the .min suffix.
   *
   * @src .scss files
   * @dest .css files from sass compilation
   */
  gulp.task('sassMin', function () {
    // return not used here as it crashes the watcher
    return gulp.src([configs.tasks.sass.dest + '/*.css', '!' + configs.tasks.sass.dest + '/*.min.css'])
      .pipe(plumber({
        errorHandler: function (err) {
          console.log("CSS Minify Error");
          console.log(err);
        }
      }))
      .pipe(csso())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(configs.tasks.sass.dest));
  });
};


/**
 * Watchers
 * --------
 */

//gulp.watch(configs.tasks.sass.watch, ['sass']);
watch(configs.tasks.sass.watch, function () {
  gulp.start('sass');
});


/**
 * Exports
 * -------
 */

module.exports.sassCompile = sassCompile;
module.exports.sassMin = sassMin;
module.exports.sass = sass;