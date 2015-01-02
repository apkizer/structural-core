var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('default', ['buildJS', 'buildCSS']);

gulp.task('buildJS', function () {
    return gulp.src(['src/js/*.js', 'src/js/representations/*.js', 'src/js/algorithms/*.js'])
        .pipe(concat('structural.js'))
        .pipe(gulp.dest('build'))
        .pipe(rename('structural.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

gulp.task('buildCSS', function () {
    return gulp.src('src/**/*.css')
        .pipe(concat('structural.css'))
        .pipe(gulp.dest('build'));
});
