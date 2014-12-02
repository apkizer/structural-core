module.exports = function(grunt) {
    grunt.initConfig({
        clean :{
            build: {
                src: ['build']
            }
        },
        concat: {
            options: {
                separator: '\n\n'
            },
            js: {
                src: [
                    'src/js/core/core.js',
                    'src/js/core/Component.js',
                    'src/js/core/View.js',
                    'src/js/core/deferred/AsyncFunctionQueue.js',
                    'src/js/core/deferred/Deferred.js',
                    //'src/js/components/*.js',
                    'src/js/components/array.js',
                    'src/js/components/array.view.js',
                    'src/js/components/tree.js',
                    'src/js/components/tree.view.js',
                    'src/js/components/heap.js',
                    'src/js/components/heap.view.js',
                    
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
        comments: {
            strip_comments: {
              options: {
                singleline: true,
                multiline: true
              },
              src: ['build/structural.js']
            }
        },
        qunit: {
          files: ['test/test.html']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-stripcomments');
  

    grunt.registerTask('default', ['clean', 'concat', 'jsbeautifier', 'uglify']);
    grunt.registerTask('test', 'qunit');                                   
                                   
};
