/*
* JavaScript tracker for Snowplow: Gruntfile.js
*
* Significant portions copyright 2010 Anthon Pang. Remainder copyright
* 2012-2014 Snowplow Analytics Ltd. All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are
* met:
*
* * Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*
* * Redistributions in binary form must reproduce the above copyright
* notice, this list of conditions and the following disclaimer in the
* documentation and/or other materials provided with the distribution.
*
* * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
* names of their contributors may be used to endorse or promote products
* derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var semver = require('semver');

/*global module:false*/
module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');
  pkg.pinnedVersion = semver.major(pkg.version);
  var banner = "/*!" +
  " * Telligent Data: Making data simple.\n" +
  " *\n" +
  " * @description <%= pkg.description %>\n" +
  " * @version     <%= pkg.version %>\n" +
  " * @author      " + pkg.contributors.join(', ') +"\n" +
  " * @copyright   Anthon Pang, Snowplow Analytics Ltd, Telligent Data LLC\n" +
  " * @license     <%= pkg.license %>\n" +
  " */\n\n" +
  "/*\n" +
  "\n" +
  "/*\n" +
  " * Browser [In]Compatibility\n" +
  " * - minimum required ECMAScript: ECMA-262, edition 3\n" +
  " *\n" +
  " * Incompatible with these (and earlier) versions of:\n" +
  " * - IE4 - try..catch and for..in introduced in IE5\n" +
  " *- IE5 - named anonymous functions, array.push, encodeURIComponent, decodeURIComponent, and getElementsByTagName introduced in IE5.5\n" +
  " * - Firefox 1.0 and Netscape 8.x - FF1.5 adds array.indexOf, among other things\n" +
  " * - Mozilla 1.7 and Netscape 6.x-7.x\n" +
  " * - Netscape 4.8\n" +
  " * - Opera 6 - Error object (and Presto) introduced in Opera 7\n" +
  " * - Opera 7\n" +
  " */\n\n";

  grunt.initConfig({

    banner: banner,

    pkg: pkg,

    subdomain: process.env.SUBDOMAIN,

    browserify: {
      main: {
        files: {
          'dist/bundle.js': ['src/js/init.js']
        }
      },
      test: {
        files: {
          'tests/pages/helpers.js': ['tests/scripts/helpers.js'],
          'tests/pages/detectors.js': ['tests/scripts/detectors.js'],
          'tests/pages/telligent.js': ['src/js/init.js']
        }
      }
    },

    concat: {
      deploy: {
        options: {
          'report': 'gzip',
          'banner': '<%= banner %>',
          'process': true
        },
        src: ['dist/bundle.js'],
        dest: 'dist/telligent.js'
      },
      package: {
        options: {
          'report': 'gzip',
          'banner': '<%= banner %>',
          'process': true
        },
        src: ['src/js/telligent.js'],
        dest: 'telligent.js'
      },
      tag: {
        options: {
          banner: ';'
        },
        src: ['tags/tag.min.js'],
        dest: 'tags/tag.min.js'
      },
      test: {
        options: {
          'process': true
        },
        src: ['tests/pages/integration-template.html'],
        dest: 'tests/pages/integration.html'
      }
    },

    min: {
      deploy: {
        options: {
          linebreak: 1000,
          report: 'gzip'
        },
        files: [
          {
            src: 'dist/telligent.js',
            dest: 'dist/tel.js'
          }
        ]
      },
      tag: {
        options: {
          linebreak: 80
        },
        files: [
          {
            src: 'tags/tag.js',
            dest: 'tags/tag.min.js'
          }
        ]
      }
    },

    intern: {
      nonfunctional: {
        options: {
          runType: 'client',
          config: 'tests/intern.js',
          suites: [
            'tests/nonfunctional/helpers.js',
            'tests/nonfunctional/in_queue.js',
            'tests/nonfunctional/proxies.js'
            ]
        }
      },
      functional: {
        options: {
          runType: 'runner',
          config: 'tests/intern.js',
          functionalSuites: ['tests/functional/helpers.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('intern');

  grunt.registerTask('default', 'Browserify, add banner, and minify', ['browserify:main', 'concat:deploy', 'min:deploy']);
  grunt.registerTask('package', 'Concat and save to root.', ['concat:package']);
  grunt.registerTask('tags', 'Minifiy the Telligent invocation tag', ['min:tag', 'concat:tag']);
  grunt.registerTask('setup-test-environment', 'Set up a test environment and webpage', ['browserify:test', 'concat:test']);
  grunt.registerTask('test-nonfunctional', 'Run intern\'s nonfunctional tests', ['intern:nonfunctional']);
  grunt.registerTask('test-functional', 'Run intern functional tests', ['intern:functional']);
}
