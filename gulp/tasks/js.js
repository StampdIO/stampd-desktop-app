/**
 * Gulp js
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
//var watchify = require('watchify');
//var browserify = require('browserify');
//var reactify = require('reactify');
//var babelify = require('babelify');
//var source = require('vinyl-source-stream');
//var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
//var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
//var react      = require('gulp-react');


/**
 * Task Definitions
 * ----------------
 */

var jsHint = function () {

  /**
   * Hints your JS files to show possible errors.
   */
  gulp.task('jsHint', function () {

    return gulp.src([configs.tasks.js.src])
    //.pipe(react())
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
  });
};

var singleJSMin = function () {

  /**
   * Uglifies JS files and adds the .min suffix.
   *
   * @src .js bundled file
   * @dest .min.js uglified bundled file
   */
  gulp.task('singleJSMin', function () {
    return gulp.src(configs.tasks.singleJSFile.src)
      .pipe(plumber({
        errorHandler: function (err) {
          console.log("Single JS File Minify Plumber Error");
          console.log(err);
        }
      }))
      .pipe(gulp.dest(configs.tasks.singleJSFile.dest))
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(configs.tasks.singleJSFile.dest));
  });
};


/**
 * Watchers
 * --------
 */

////gulp.watch(configs.tasks.js.watch, ['jsMin']);
////gulp.watch(configs.tasks.js.watch, ['jsHint']);
//watch(configs.tasks.js.watch, function() {
//    gulp.start('jsMin');
//    //gulp.start('jsHint');
//});

watch(configs.tasks.singleJSFile.watch, function () {
  gulp.start('singleJSMin');
  //gulp.start('jsHint');
});


/**
 * Exports
 * -------
 */

//module.exports.js = js;
//module.exports.jsMin = jsMin;
//module.exports.jsHint = jsHint;
module.exports.singleJSMin = singleJSMin;
