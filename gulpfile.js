const gulp = require('gulp')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const pug = require('gulp-pug')
const plumber = require('gulp-plumber')
const imagemin = require('gulp-imagemin')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const cleanCss = require('gulp-clean-css')
const rename = require('gulp-rename')
const concat = require('gulp-concat')
const babel = require('gulp-babel')

const del = require('del')
const browserSync = require('browser-sync').create()

const mustart = require('./mustart.json')
const conf = mustart.configuration
const dir = conf.directory

gulp.task('clean', () => {
  return del([ dir.build ])
})

gulp.task('pages', () => {
  return gulp.src([ `${dir.pages}/**/*.pug` ])
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest(dir.build))
    .pipe(browserSync.stream())
})

gulp.task('styles', () => {
  return gulp.src([ `${dir.styles}/**/*.sass` ])
    .pipe(plumber())
    .pipe(sass({
      indentedSyntax: true
    }))
    .pipe(autoprefixer({
      browsers: ['last 5 versions'],
      cascade: false
    }))
    .pipe(cleanCss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(`${dir.build}/styles`))
    .pipe(browserSync.stream())
})

gulp.task('scripts', () => {
  return gulp.src(mustart.scripts.concat([ `${dir.scripts}/*.js` ]))
    .pipe(plumber())
    .pipe(babel({
      presets: [ '@babel/env' ]
    }))
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(`${dir.build}/scripts`))
    .pipe(browserSync.stream())
})

gulp.task('images', () => {
  return gulp.src([ `${dir.images}/**/*.+(png|jpg|jpeg|gif|svg|ico)` ])
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(`${dir.build}/images`))
    .pipe(browserSync.stream())
})

gulp.task('misc', () => {
  return gulp.src([ `${dir.misc}/**/*` ])
    .pipe(gulp.dest(dir.build))
    .pipe(browserSync.stream())
})

gulp.task('build', gulp.series('clean', 'pages', 'styles', 'scripts', 'images', 'misc'))
gulp.task('dev', gulp.series('pages', 'styles', 'scripts'))
gulp.task('assets', gulp.series('images', 'misc'))

gulp.task('serve', () => {
  return browserSync.init({
    server: {
      baseDir: [ dir.build ]
    },
    port: 3000,
    open: false
  })
})

gulp.task('watch', () => {
  const watch = [
    `${dir.templates}/**/*.pug`,
    `${dir.pages}/**/*.pug`,
    `${dir.styles}/**/*.sass`,
    `${dir.scripts}/**/*.js`
  ]
  const watchAssets = [
    `${dir.images}/**/*.+(png|jpg|jpeg|gif|svg|ico)`,
    `${dir.misc}/**/*.*`
  ]

  gulp.watch(watch, gulp.series('dev')).on('change', browserSync.reload)
  gulp.watch(watchAssets, gulp.series('assets')).on('change', browserSync.reload)

  return true
})

gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')))
