module.exports = {
    suites: {
        browser: {
            exec: 'dom',
            env: [
              '/.import/mask.js'
            ],
            $config: {
                $before: function(done){
                    include
                        .load('/lib/compo.embed.js::Source')
                        .done(function(resp){
                            mask.plugin(resp.load.Source);
                            done();
                        })
                }
            },
            tests: 'test/**.test'
        }
    }
};
