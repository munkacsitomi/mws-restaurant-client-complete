const gulp = require('gulp');
const imageResize = require('gulp-image-resize');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');

gulp.task('resize-images', () => {
  const imgs = gulp.src('assets/img/*');
  const srcsetFolder = 'img_srcset';
  const largeWidth = 800;
  const smallWidth = 540;

  imgs
    .pipe(imageResize({ width: largeWidth }))
    .pipe(
      rename(path => {
        path.basename = `${path.basename}-${largeWidth}_large_1x`;
      })
    )
    .pipe(gulp.dest(srcsetFolder));

  imgs
    .pipe(imageResize({ width: smallWidth }))
    .pipe(
      rename(path => {
        path.basename = `${path.basename}-${smallWidth}_small_1x`;
      })
    )
    .pipe(gulp.dest(srcsetFolder));
});

gulp.task('scripts', () => {
  gulp
    .src('assets/js/**/*.js')
    // .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', () => {
  gulp
    .src('assets/js/**/*.js')
    // .pipe(concat('all.js'))
    .pipe(minify({
      ext: {
        min: '.min.js'
      }
    }))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', () => {
  gulp.src(['index.html', 'restaurant.html']).pipe(gulp.dest('./dist'));
});

gulp.task('copy-sw', () => {
  gulp.src('./sw.js').pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', () => {
  gulp.src('assets/img_srcset/*').pipe(gulp.dest('dist/img_srcset'));
});

gulp.task('styles', () => {
  gulp
    .src('assets/css/**/*.css')
    .pipe(concat('styles.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('dist', ['copy-html', 'copy-images', 'copy-sw', 'styles', 'scripts-dist']);

gulp.task('default', ['copy-html', 'copy-images', 'copy-sw', 'styles', 'scripts'], () => {
  gulp.watch('css/**/*.css', ['styles']);
  gulp.watch('js/**/*.js', ['scripts']);
  gulp.watch(['index.html', 'restaurant.html'], ['copy-html']);
  gulp.watch(['dist/*.html']).on('change', browserSync.reload);

  browserSync.init({
    server: './dist',
    port: 8000
  });
});
