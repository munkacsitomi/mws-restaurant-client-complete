const gulp = require('gulp');
const imageResize = require('gulp-image-resize');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const shell = require('gulp-shell');

gulp.task('resize-images', () => {
  const imgs = gulp.src('src/assets/img/*');
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
    .src('src/assets/js/**/*.js')
    .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', () => {
  gulp
    .src('src/assets/js/**/*.js')
    .pipe(minify({
      ext: {
        min: '.min.js'
      }
    }))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', () => {
  gulp.src(['src/index.html', 'src/restaurant.html']).pipe(gulp.dest('./dist'));
});

gulp.task('copy-sw', () => {
  gulp.src('src/sw.js').pipe(gulp.dest('./dist'));
  gulp.src('src/manifest.json').pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', () => {
  gulp.src('src/assets/img_srcset/*').pipe(gulp.dest('dist/img_srcset'));
  gulp.src('src/assets/icons/*').pipe(gulp.dest('dist/icons'));
});

gulp.task('styles', () => {
  gulp
    .src('src/assets/css/**/*.css')
    .pipe(concat('styles.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('run-server', shell.task('http-server dist -p 8000'))

gulp.task('dist', ['copy-html', 'copy-images', 'copy-sw', 'styles', 'scripts-dist']);

gulp.task('default', ['dist', 'run-server']);
