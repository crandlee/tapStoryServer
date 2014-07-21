module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['server/**/*.js','app/**/*.js']
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");

};