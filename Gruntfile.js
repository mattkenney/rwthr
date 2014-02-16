module.exports = function (grunt) {
  grunt.initConfig({
    uglify: {
      options: {
          preserveComments: "some"
      },
      dist: {
        files: {
          'public/js/weather.js': ['src/js/weather.js'],
          'public/js/tropics.js': ['src/js/tropics.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);
};
