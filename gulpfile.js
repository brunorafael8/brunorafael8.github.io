const gulp = require('gulp')
    , clean = require('gulp-clean')
    , cssmin = require('gulp-cssmin')
    , autoprefixer = require('gulp-autoprefixer')
    , csslint = require('gulp-csslint')
    , sass = require('gulp-sass')
    , uglify = require('gulp-uglify')
    , babel = require('gulp-babel')
    , jshint = require('gulp-jshint')
    , jshintStylish = require('jshint-stylish')
    , usemin = require('gulp-usemin')
    , browserSync = require('browser-sync')
    , swPrecache = require('./node_modules/sw-precache/lib/sw-precache.js');

csslint.addFormatter('csslint-stylish');
prefixerOpts = {browsers: ['last 15 versions']};

gulp.task('default', ['clearDist'], () => gulp.start('copyImg', 'minifyAll', 'copyFonts', 'generate-service-worker-prod'));

gulp.task('clearDist', () => gulp.src('dist').pipe(clean()));

gulp.task('copyImg', () => gulp.src('src/img/**/*').pipe(gulp.dest('dist/img')));

gulp.task('copyFonts', () => gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/fonts')));

gulp.task('sass', () =>  gulp.src('src/sass/**/*.scss').pipe(sass().on('error', sass.logError)).pipe(autoprefixer(prefixerOpts)).pipe(gulp.dest('src/css')));

gulp.task('minifyAll', ['sass'], () => gulp.src('src/**/*.html').pipe(usemin({
    'js': [babel({presets: ['es2015']}),uglify({ mangle: false })],
    'css': [autoprefixer(prefixerOpts), cssmin]
})).pipe(gulp.dest('dist')));

gulp.task('develop', ['generate-service-worker-dev'],  () => {
    
    browserSync.init({server : {baseDir : 'src'}});

    gulp.watch('src/**/*').on('change', browserSync.reload);

    gulp.watch('src/js/**/*.js').on('change', (event) => {
        console.log(`Linting.js: ${event.path}`);
        gulp.src(event.path).pipe(jshint({"esversion": 6})).pipe(jshint.reporter(jshintStylish));
    });

    gulp.watch('src/sass/**/*.scss', ['sass']);

    gulp.watch('src/css/**/*.css').on('change', (event) => {
        console.log('Linting.css ${event.path}');
        gulp.src(event.path).pipe(csslint()).pipe(csslint.formatter('stylish'));
    });
    gulp.watch('src/**/*', ['generate-service-worker-dev']);
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
