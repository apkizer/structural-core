module.exports = function(grunt) {
    grunt.initConfig({
        clean :{
            build: {
                src: ['build']
            }
        },
        concat: {
            options: {
                banner: '"use strict";\n/* Structural, by Alex Kizer */\n'
            },
            js: {
                src: [
                    'src/js/header.js',
                    'src/js/core.js',
                    'src/js/config.js',
                    'src/js/eventEmitter.js',
                    'src/js/baseComponent.js',
                    'src/js/baseView.js',
                    'src/js/deferred.js',
                    'src/js/footer.js',
                    'src/js/components/*.js'
                    
                     ],
                dest: 'build/structural.js'
            },
            css: {
                src: ['src/css/*.css'],
                dest: 'build/structural.css'
            }
        },
        uglify: {
            options: {
                sourcemap: true
            }, 
            dist: {
                files: {
                    'build/structural.min.js': ['build/structural.js']
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('default', ['clean', 'concat', 'uglify']);
};