module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['server/**/*.js','app/**/*.js'],
            options: {
                node: true,
                globals: {
                    /* MOCHA */
                    describe: false,
                    it: false,
                    before: false,
                    beforeEach: false,
                    after: false,
                    afterEach: false
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");

};