MVP Serverless Integration for [FN](https://github.com/fnproject/fn).

- examples
- how to install
- how to use


Come up with  ways to possibly unblock current blockers.

Minimum features:

- sls deploy (fn deploy)
    - Need to add support for full config. (mem cpu etc..)
    - Need to add deploy single func
    - Need to add language helpers(Discuss how to do this)
        - This means not just docker file. But making temp docker file etc..
- sls package (fn build)
    - Just build the docker images for each func.. Might mean refactoring sls deploy currently have.
    - Could exclude not sure.
- sls info (fn apps / routes this is for info about deployed service so maybe detect what svc / app and auto do inspect on that one.)
    - Display info for the service/ app and all of its routes.

Blockers:

- Yaml config supports comments in sls. Which means sls cannot write to yaml since parsers do not preserve commnets on write.
    - Write custom parser that will preserve comments (No exp with this./ ++Time)
    - Store version outside of the yaml and next to each func.(lang ext.)
    - Use server to get curr version bump from there. If not on server use version in config.
