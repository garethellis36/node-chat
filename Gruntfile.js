module.exports = function (grunt) {
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-clean");	
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-sass");		
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.initConfig({

		sass: {
			dist: {
				files: {
					'example-client/dist/css/style.css': 'example-client/src/style.scss'
				},
				options: {
					outputStyle: 'compressed'
				}
			}
		},

		jshint: {
			src: "example-client/src/app.js"
		},

		clean: {
			js: {
				src: [
					'example-client/dist/js/',
					'example-client/dist/css/'
				]
			}
		},

		copy: {
			jquery: {
				expand: true,
				src: [
					"jquery.min.js",
					"jquery.min.map"
				],
				dest: "example-client/dist/js/",
				cwd: "example-client/src/vendor/jquery/dist"
			},
			alertifyJS: {
				expand: true,
				src: [
					"alertify.min.js"
				],
				dest: "example-client/dist/js",
				cwd: "example-client/src/vendor/alertify"
			},
			alertifyCSS: {
				expand: true,
				src: [
					"*.css"
				],
				dest: "example-client/dist/css",
				cwd: "example-client/src/vendor/alertify/themes"
			},
			app: {
				expand: true,
				src: [
					"app.js"
				],
				dest: "example-client/dist/js/",
				cwd: "example-client/src/"
			}			
		},

		watch: {
			build: {
				files: ['example-client/src/*.js', 'example-client/src/*.scss'],
				tasks: ['default']
			}
		}

	});

	grunt.registerTask("default", ["clean", "copy", "sass"]);

}