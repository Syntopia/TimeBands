var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');
    gp_sourcemaps = require('gulp-sourcemaps');

gulp.task('build', function(){
    return gulp.src(['source/TextBoxStyle.js','source/Viewport.js','source/Band.js','source/TimeBand.js','source/timebands.js','source/timebandsparser.js'])
        .pipe(gp_sourcemaps.init())
        .pipe(gp_concat('timebands-dev.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('timebands-dev.min.js'))
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build2', function(){
    return gulp.src(['source/TextBoxStyle.js','source/Viewport.js','source/Band.js','source/TimeBand.js','source/timebands.js','source/timebandsparser.js'])
        .pipe(gp_sourcemaps.init())
        .pipe(gp_concat('timebands-dev2.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('timebands-dev2.min.js'))
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});


gulp.task('default', ['build'], function(){
  // watch for JS changes
  gulp.watch('source/*.js', function() {
    gulp.run('build');
  });
});