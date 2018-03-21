/**
 * Gulp fonts
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
var plumber = require('gulp-plumber');
var fontGen = require('gulp-fontgen');
var notify = require('gulp-notify');
var watch = require('gulp-watch');


/**
 * Task Definitions
 * ----------------
 */

var fonts = function () {

  gulp.task('fonts', function () {
    gulp.src(configs.tasks.fonts.src/*, {read: false}*/)
      .pipe(plumber({
        errorHandler: function (err) {
          console.log("Webfonts Plumber Error");
          console.log(err);
        }
      }))
      .pipe(fontGen({
        dest: configs.tasks.fonts.dest
      }))
      // .pipe(gulp.dest(configs.tasks.fonts.dest))
      .pipe(notify({
        message: "Webfonts Created",
        onLast: true
      }));
  });
};

/**
 * Watchers
 * --------
 */

//gulp.watch(configs.tasks.sass.watch, ['sass']);
watch(configs.tasks.fonts.watch, function () {
  gulp.start('fonts');
});


/**
 * Exports
 * -------
 */

module.exports.fonts = fonts;