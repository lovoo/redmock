'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import rimraf from 'rimraf';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';
import jscs from 'gulp-jscs';
import stylish from 'gulp-jscs-stylish';
import jshint from 'gulp-jshint';
import coveralls from 'gulp-coveralls';

const isparta = require('isparta');

let watching = false;

function onError(err) {
  console.log(err.toString());
  if (watching) {
    this.emit('end');
  } else {
    process.exit(1);
  }
}

gulp.task('clean', (done) => {
  rimraf.sync('server');
  done();
});

gulp.task('jshint', [ 'clean' ], () => {
  return gulp.src('./src/**/*.js')
    .pipe(jshint({'esnext':true,'node':true}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', [ 'jshint' ], () => {
  return gulp.src('./src/**/*.js')
    .pipe(jscs({esnext:true}))
    .pipe(stylish())
    .pipe(jscs.reporter('fail'));
});

gulp.task('babel', [ 'jscs' ], () => {
  return gulp.src('./src/**/*.js')
    .pipe(babel({
      presets: ['es2016-node5']
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('build', [ 'babel' ]);

gulp.task('instrument', [ 'build' ], () => {
  return gulp.src([ './src/**/*.js' ])
    .pipe(istanbul({
      instrumenter: isparta.Instrumenter,
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('unitTest', [ 'instrument' ], () => {
  let mochaOpts = {
    reporter: 'spec',
    bail: !watching
  };
  let thresholds = {
    thresholds: {
      global: 90
    }
  }
  return gulp.src([ './test/unit/**/*.js' ], {read: false})
    .pipe(mocha(mochaOpts))
    .on('error', onError)
    .pipe(istanbul.writeReports({dir:'./coverage/unit'}))
    .pipe(istanbul.enforceThresholds(thresholds));
});

gulp.task('functionalTest', [ 'unitTest' ], () => {
  let mochaOpts = {
    reporter: 'spec',
    bail: !watching
  };
  return gulp.src([ './test/functional/**/*.js' ], {read: false})
    .pipe(mocha(mochaOpts))
    .on('error', onError);
});

gulp.task('coveralls', [ 'functionalTest' ], () => {
  return gulp.src('./coverage/unit/lcov.info')
    .pipe(coveralls());
});

gulp.task('travisTest', [ 'coveralls' ]);

gulp.task('default', [ 'functionalTest' ]);
