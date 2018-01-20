"use strict";

const gulp = require("gulp"),
  watch = require("gulp-watch"),
  prefixer = require("gulp-autoprefixer"),
  uglify = require("gulp-uglify"),
  sass = require("gulp-sass"),
  sourcemaps = require("gulp-sourcemaps"),
  rigger = require("gulp-rigger"),
  cleanCSS = require("gulp-clean-css"),
  imagemin = require("gulp-imagemin"),
  pngquant = require("imagemin-pngquant"),
  rimraf = require("rimraf"),
  browserSync = require("browser-sync"),
  ghPages = require("gulp-gh-pages"),
  reload = browserSync.reload;

const path = {
  build: {
    html: "build/",
    css: "build/css/",
    img: "build/img/"
  },
  src: {
    html: "src/*.html",
    style: "src/style/main.scss",
    img: "src/img/**/*.*"
  },
  watch: {
    html: "src/**/*.html",
    style: "src/style/**/*.scss",
    img: "src/img/**/*.*"
  },
  clean: "./build"
};

const config = {
  server: {
    baseDir: "./build"
  },
  tunnel: true,
  host: "localhost",
  port: 9000,
  logPrefix: "Frontend"
};
gulp.task("webserver", function() {
  browserSync(config);
});
gulp.task("clean", function(cb) {
  rimraf(path.clean, cb);
});
gulp.task("html:build", function() {
  gulp
    .src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({ stream: true }));
});
gulp.task("style:build", function() {
  gulp
    .src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        sourceMap: true,
        errLogToConsole: true,
        includePaths: require("node-normalize-scss").includePaths
      })
    )
    .pipe(prefixer())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({ stream: true }));
});
gulp.task("image:build", function() {
  gulp
    .src(path.src.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()],
        interlaced: true
      })
    )
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({ stream: true }));
});

gulp.task("build", ["html:build", "style:build", "image:build"]);
gulp.task("watch", function() {
  watch([path.watch.html], function(event, cb) {
    gulp.start("html:build");
  });
  watch([path.watch.style], function(event, cb) {
    gulp.start("style:build");
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start("js:build");
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start("image:build");
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start("fonts:build");
  });
});
gulp.task("default", ["build", "webserver", "watch"]);
gulp.task("deploy", function() {
  return gulp.src("./build/**/*").pipe(ghPages());
});
