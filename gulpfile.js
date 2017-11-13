var gulp        = require('gulp');
// browser sync
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;

// +-------------- tasks -----------------+ 
// + -------------------------------------+
// serve - main task
gulp.task('serve',  function() {

    browserSync.init({
        server: "./"
    });

    gulp.watch("./*.html").on('change', browserSync.reload);

});

// default
gulp.task('default', ['serve']);
