'use strict';
const gulp = require('gulp');
const fs = require('fs');
const browserSync = require('browser-sync');
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnext = require('postcss-cssnext');
const plumber = require('gulp-plumber');
const gcmq = require('gulp-group-css-media-queries');

gulp.task('server', () => {
  browserSync({
    server: { baseDir: 'dist' },
    open: 'external'
  });
});

gulp.task('ejs', () => {
  const jsonFile = './src/data/pages.json';
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  
  for (let i = 0; i < data.length; i++) {
    const id = data[i].id;
    const parent = Array.isArray(data[i].parent) ? data[i].parent.join('/') : data[i].parent;
    let dirName;
    if (id === 'index') {
      dirName = './dist/'
    } else if (parent) {
      dirName = `./dist/${parent}/${id}/`;
    } else {
      dirName = `./dist/${id}/`;
    }
    gulp.src('./src/ejs/template/template.ejs')
      .pipe(ejs({ data: data[i] }, {}, { ext: '.html'}))
      .pipe(rename('index.html'))
      .pipe(gulp.dest(dirName))
      .pipe(browserSync.reload({ stream: true }));
  }
});

gulp.task('scss', () => {
  const processors = [cssnext()];
  return gulp.src('./src/scss/style.scss')
    .pipe(plumber({
      errorHandler(err) {
        console.log(err.messageFormatted);
        this.emit('end');
      }
    }))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(gcmq())
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('default', ['server'], () => {
  gulp.watch('./src/ejs/**', ['ejs']);
  gulp.watch('./src/scss/**', ['scss']);
});