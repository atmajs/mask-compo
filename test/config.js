module.exports = {
    suites: {
        
        browser: {
            exec: 'dom',
            $config: {
                $before: function(done){
                    include
                        .js('/.import/mask.js')
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
