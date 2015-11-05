var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var browserSync = require('browser-sync').create();

gulp.task('scss', function () {
    var AUTOPREFIXER_BROWSERS = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ];

    return gulp.src('scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./'))
        .pipe(browserSync.stream());
});

gulp.task('watch', function () {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch('scss/**/*.scss', ['scss']);
    gulp.watch('*.html').on('change', browserSync.reload);
});

gulp.task('default', ['watch']);