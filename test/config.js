module.exports = {
    suites: {
        browser: {
            exec: 'dom',
            env: [
              '/bower_components/maskjs/lib/mask.js',
              '/lib/compo.js'
            ],
            $config: {
                $before: function(done){
                    // deprecated
                    include
                        .load('/lib/compo.embed.js::Source')
                        .done(function(resp){
                            //window.mask.plugin(resp.load.Source);
                            //window.Compo = window.mask.Compo;
                            //window.mask.XX = 'FooFoo';
                            done();
                        })
                }
            },
            tests: 'test/**.test'
        }
    }
};
