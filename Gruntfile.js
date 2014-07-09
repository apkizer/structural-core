module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            options: {
                banner: '/* Structural, by Alex Kizer */ \n'
            },
            dist: {
                src: ['js/*.js'],
                dest: 'structural.js'
            }
        },
        uglify: {
            options: {
                sourcemap: true
            }, 
            dist: {
                files: {
                    'structural.min.js': ['structural.js']
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default', ['concat', 'uglify']);
};