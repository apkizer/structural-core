var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

/* build everything */
gulp.task('default', ['buildJSRepresentationsAlgorithms', 'buildCSS']);

/* build only the core library */
gulp.task('buildJSCore', function () {
    return gulp.src(['src/js/structural.js'])
        .pipe(gulp.dest('build')
        .pipe(rename('structural.min.js')
        .pipe(gulp.des('build'));
});

/* build only the core library and included representations */
gulp.task('buildJSRepresentations', function () {
    return gulp.src(['src/js/structural.js', 'src/js/representations/**/*.js'])
        .pipe(concat('structural.js'))
        .pipe(gulp.dest('build'))
        .pipe(rename('structural.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

/* build the core library, included representations, and included algorithms */
gulp.task('buildJSRepresentationsAlgorithms', function () {
    return gulp.src(['src/js/structural.js', 'src/js/representations/**/*.js', 'src/js/algorithms/**/*.js'])
        .pipe(concat('structural.js'))
        .pipe(gulp.dest('build'))
        .pipe(rename('structural.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

/* concatenate css files of every representation */
gulp.task('buildCSS', function () {
    return gulp.src('src/representations/**/*.css')
        .pipe(concat('structural.css'))
        .pipe(gulp.dest('build'));
});
