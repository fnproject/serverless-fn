'use strict';
const fs = require('fs');
const LangHelper = require('./base');

class RubyHelper extends LangHelper {
    runtime() {
        return this.langStrings()[0];
    }

    langStrings() {
        return ['ruby'];
    }
    extensions() {
        return ['.rb'];
    }
    defaultFormat() {
        return 'json';
    }
    buildFromImage() {
        return 'fnproject/ruby:dev';
    }

    runFromImage() {
        return 'fnproject/ruby';
    }

    dockerfileBuildCmds() {
        const r = [];
        if (fs.exists('Gemfile')) {
            r.push('ADD Gemfile* /function/');
            r.push('RUN bundle install');
        }
        return r;
    }

    dockerfileCopyCmds() {
        return [
			// skip this if no Gemfile?  Does it matter?
            'COPY --from=build-stage /usr/lib/ruby/gems/ /usr/lib/ruby/gems/',
            'ADD . /function/',
        ];
    }

    entrypoint() {
        return 'ruby func.rb';
    }

    hasBoilerplate() { return false; } // XXX add boiler plate

    generateBoilerplate() {
	// XXX Add boiler plate later
    }
}

module.exports = RubyHelper;
