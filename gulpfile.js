const gulp = require('gulp');
const imageResize = require('gulp-image-resize');
const rename = require('gulp-rename');

gulp.task('resize-images', () => {
  const imgs = gulp.src('img/*');
  const srcsetPath = 'img_srcset';
  const largeWidth = 800;
  const smallWidth = 540;

  imgs
    .pipe(
      imageResize({
        width: largeWidth
      })
    )
    .pipe(
      rename(path => {
        path.basename = `${path.basename}-${largeWidth}_large_1x`;
      })
    )
    .pipe(gulp.dest(srcsetPath));

  imgs
    .pipe(
      imageResize({
        width: smallWidth
      })
    )
    .pipe(
      rename(path => {
        path.basename = `${path.basename}-${smallWidth}_small_1x`;
      })
    )
    .pipe(gulp.dest(srcsetPath));
});

gulp.task('default', ['resize-images']);
