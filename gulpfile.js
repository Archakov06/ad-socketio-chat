var gulp = require('gulp'),
	pug = require('gulp-pug'),
	stylus = require('gulp-stylus'),
	watch = require('gulp-watch'),
	rename = require("gulp-rename"),
	uglify = require('gulp-uglifyjs');

gulp.task('styl', function () {
	return gulp.src('src/stylus/style.styl')
	    .pipe(stylus({compress: true}))
	    .pipe(rename('app.min.css'))
	    .pipe(gulp.dest('public/css'));
});

gulp.task('js', function () {
	return gulp.src(['src/js/libs/*.js','src/js/app.js'])
	    .pipe(uglify('app.min.js'))
	    .pipe(gulp.dest('public/js'));
});

gulp.task('pug', function () {
	return gulp.src('src/index.pug')
    	.pipe(pug({pretty: true}))
    	.pipe(gulp.dest(''));
});

gulp.task('watch:pug', function(){
	return gulp.src('src/index.pug')
    	.pipe(watch('src/index.pug'))
    	.pipe(pug({pretty: true}))
    	.pipe(gulp.dest(''));
});

gulp.task('watch:styl', function(){
    return gulp.watch('src/stylus/**/*', ['styl']);
});

gulp.task('watch:js', function(){
    return gulp.watch('src/js/**/*', ['js']);
});

gulp.task('watch:all', ['watch:pug','watch:styl','watch:js']);
gulp.task('build', ['pug','styl','js']);
