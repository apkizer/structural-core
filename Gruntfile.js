module.exports = function(grunt) {
    grunt.initConfig({
        clean :{
            build: {
                src: ['build']
            }
        },
        concat: {
            options: {
                banner: '/* Structural, by Alex Kizer */\n',
                separator: '\n'
            },
            js: {
                src: [
                    'src/js/core/header.js',
                    'src/js/core/core.js',
                    'src/js/core/config.js',
                    'src/js/core/utils.js',
                    'src/js/core/eventEmitter.js',
                    'src/js/core/baseComponent.js',
                    'src/js/core/baseView.js',
                    'src/js/core/standardComponent.js',
                    'src/js/core/deferred.js',
                    'src/js/core/api.js',
                    'src/js/core/footer.js',
                    'src/js/components/*.js',
                    'src/js/algorithms/*.js'
                    
                     ],
                dest: 'build/structural.js'
            },
            css: {
                src: ['src/css/*.css'],
                dest: 'build/structural.css'
            }
        },
        jsbeautifier: {
          src: ['build/structural.js'],
          options: {
            js: {
              jslintHappy: true
            }
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
        },
        qunit: {
          files: ['test/index.html']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-jsbeautifier');
  

    grunt.registerTask('default', ['clean', 'concat', 'jsbeautifier', 'uglify']);
    grunt.registerTask('test', 'qunit');                                   
                                   
};