/**
 * Gulp images
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
var imageMin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');


/**
 * Task Definitions
 * ----------------
 */

var imgCompress = function () {

  /**
   * Compresses images
   *
   * @src image files
   * @dest compressed image files
   */
  gulp.task('imgCompress', function () {
    gulp.src(configs.tasks.img.src)
      .pipe(plumber({
        errorHandler: function (err) {
          console.log("Images Plumber Error");
          console.log(err);
        }
      }))
      .pipe(imageMin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      }))
      .pipe(gulp.dest(configs.tasks.img.dest))
      .pipe(notify({
        message: "Images Compressed",
        onLast: true
      }));
  });
};


/**
 * Watchers
 * --------
 */
//
// watch(configs.tasks.img.watch, function () {
//   gulp.start('imgCompress');
// });


/**
 * Exports
 * -------
 */

module.exports.imgCompress = imgCompress;