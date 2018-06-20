module.exports = function(grunt) {
  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [
            {
              width: 800,
              suffix: '_large_1x',
              quality: 90
            },
            {
              width: 540,
              suffix: '_small_1x',
              quality: 50
            }
          ]
        },
        files: [
          {
            expand: true,
            src: ['*.{gif,jpg,png}'],
            cwd: 'img/',
            dest: 'img_srcset'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.registerTask('default', ['responsive_images']);
};
