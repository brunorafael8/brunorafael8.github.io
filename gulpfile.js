const gulp = require('gulp')
    , clean = require('gulp-clean')
    , imagemin = require('gulp-imagemin')
    , cssmin = require('gulp-cssmin')
    , autoprefixer = require('gulp-autoprefixer')
    , csslint = require('gulp-csslint')
    , sass = require('gulp-sass')
    , uglify = require('gulp-uglify')
    , sourcemaps = require('gulp-sourcemaps')
    , babel = require('gulp-babel')
    , concat = require('gulp-concat')
    , jshint = require('gulp-jshint')
    , jshintStylish = require('jshint-stylish')
    , usemin = require('gulp-usemin')
    , browserSync = require('browser-sync')
    , swPrecache = require('./node_modules/sw-precache/lib/sw-precache.js')
    , inlinesource = require('gulp-inline-source')
    , htmlmin = require('gulp-htmlmin');

csslint.addFormatter('csslint-stylish');
prefixerOpts = {browsers: ['last 15 versions']};

gulp.task('default', ['copy'], () => gulp.start('sass', 'usemin', 'minifyhtml', 'build-img', 'generate-service-worker-prod'));

gulp.task('clearDist', () => gulp.src('dist').pipe(clean()));

gulp.task('build-img', function() {
  return gulp.src('dist/img/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'));
});
gulp.task('copy', ['clearDist'], function() {
    return gulp.src('src/**/*')
        .pipe(gulp.dest('dist'));
});
gulp.task('babel', () => {
    return gulp.src('src/assets/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('assets/js/app.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});
gulp.task('usemin', ['inlinesource'], function() {
  return gulp.src('dist/**/*.html')
    .pipe(usemin({
      js: [babel],
      css: [cssmin]
    }))
    .pipe(gulp.dest('dist'));
});
gulp.task('inlinesource', function () {
    return gulp.src('./src/*.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('./dist'));
});
gulp.task('minifyhtml', function() {
  return gulp.src('./src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});
gulp.task('sass', () =>  gulp.src('src/assets/sass/*.scss').pipe(sass().on('error', sass.logError)).pipe(autoprefixer(prefixerOpts)).pipe(gulp.dest('src/assets/css')));


gulp.task('develop', ['generate-service-worker-dev'],  () => {
    
    browserSync.init({server : {baseDir : 'src'}});

    gulp.watch('src/**/*').on('change', browserSync.reload);

    gulp.watch('src/assets/js/*.js').on('change', (event) => {
        console.log(`Linting.js: ${event.path}`);
        gulp.src(event.path).pipe(jshint({"esversion": 6})).pipe(jshint.reporter(jshintStylish));
    });

    gulp.watch('src/assets/sass/*.scss', ['sass']);

    gulp.watch('src/assets/css/*.css').on('change', (event) => {
        console.log('Linting.css ${event.path}');
        gulp.src(event.path).pipe(csslint()).pipe(csslint.formatter('stylish'));
    });
    gulp.watch('src/**/**/*', ['generate-service-worker-dev']);
});
gulp.task('generate-service-worker-dev', function(callback) {
  var swPrecache = require('sw-precache');
  var rootDir = 'src';

  swPrecache.write(`${rootDir}/sw.js`, {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
    stripPrefix: rootDir
  }, callback);
});
gulp.task('generate-service-worker-prod', function(callback) {
  var swPrecache = require('sw-precache');
  var rootDir = 'dist';

  swPrecache.write(`${rootDir}/sw.js`, {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
    stripPrefix: rootDir
  }, callback);
});
