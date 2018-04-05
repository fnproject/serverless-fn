'use strict';
const LangHelper = require('./base');
const fs = require('fs');

class GoHelper extends LangHelper {
    runtime() {
        return this.langStrings()[0];
    }

    defaultFormat() {
        return 'json';
    }

    langStrings() {
        return ['go'];
    }

    extensions() {
        return ['.go'];
    }

    buildFromImage() {
        return 'fnproject/go:dev';
    }

    runFromImage() {
        return 'fnproject/go';
    }

    dockerfileBuildCmds() {
        const cmds = [];
        if (fs.existsSync('vendor/') && fs.existsSync('Gopkg.toml')) {
            cmds.push('RUN go get -u github.com/golang/dep/cmd/dep');
            if (fs.existsSync('Gopkg.lock')) {
                cmds.push('ADD Gopkg.* /go/src/func/');
                cmds.push('RUN cd /go/src/func/ && dep ensure --vendor-only');
                cmds.push('ADD . /go/src/func/');
            } else {
                cmds.push('ADD . /go/src/func/');
                cmds.push('RUN cd /go/src/func/ && dep ensure');
            }
        } else {
            cmds.push('ADD . /go/src/func/');
        }
        cmds.push('RUN cd /go/src/func/ && go build -o func');

        return cmds;
    }

    dockerfileCopyCmds() { return ['COPY --from=build-stage /go/src/func/func /function/']; }

    entrypoint() { return './func'; }

    hasBoilerplate() { return false; }// XXX Return true after genboiler added

    generateBoilerplate() {
        // XXX Finish boiler plate conversion
        // const wd = process.cwd()
        //
        // var codeFile =  `${wd}/func.go`
        // if (fs.existsSync(codeFile)) {
        //     throw new Error("func.go already exists, canceling init")
        // }
        // if err := ioutil.WriteFile(codeFile, []byte(helloGoSrcBoilerplate), os.FileMode(0644)); err != nil {
        //     return err
        // }
        // depFile := "Gopkg.toml"
        // if err := ioutil.WriteFile(depFile, []byte(depBoilerplate), os.FileMode(0644)); err != nil {
        //     return err
        // }
        //
        // testFile := filepath.Join(wd, "test.json")
        // if exists(testFile) {
        //     fmt.Println("test.json already exists, skipping")
        // } else {
        //     if err := ioutil.WriteFile(testFile, []byte(goTestBoilerPlate), os.FileMode(0644)); err != nil {
        //         return err
        //     }
        // }
    }

}

module.exports = GoHelper;
