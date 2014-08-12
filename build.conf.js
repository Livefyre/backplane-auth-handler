({
    mainConfigFile: './requirejs.conf.js',
    name: 'backplane-auth-plugin',
    out: './dist/index.min.js',
    optimize: 'uglify2',
    paths: {
      almond: 'bower_components/almond/almond',
      auth: 'bower_components/livefyre-auth/src/contrib/auth-later',
      'auth/contrib': 'bower_components/auth/src/contrib'
    },
    include: ['almond'],
    cjsTranslate: true,
    uglify2: {
      compress: {
        unsafe: true
      },
      mangle: true
    },
    wrap: {
      startFile: './tools/wrap-start.frag',
      endFile: './tools/wrap-end.frag'
    }
})
