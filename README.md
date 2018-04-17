MVP Serverless Integration for [FN](https://github.com/fnproject/fn).

- [ ] examples
- [ ] how to install
- [ ] how to use


Come up with  ways to possibly unblock current blockers.

Minimum features:

- [ ] sls

- [ ] Kubeless Commands + invoke local (sls commands)
    - [ ] create
        - [ ] create a new service in the dir from the template.
    - [ ] deploy (fn deploy)
        - [ ] Handle version (Just use one from server and bump if there. Else bump from whats in yaml.)
        - [x] Deploy all of service using deploy
        - [x] Need to add support for full config. (mem cpu etc..)
        - [x] Need to add deploy single func
        - [x] Deploy just a function
        - [x] Dockerfile
        - [x] Language Specific
            - [x] Helpers
            - [x] Helper plugin points
    - [ ] invoke (Call the function that is deployed.)
        - [ ] local (Call the function locally with a container etc / build and then run.)
    - [x] logs (Get the logs for a function in the service)
    - [x] info (fn apps / routes this is for info about deployed service so maybe detect what svc / app and auto do inspect on that one.)
        - [x] Display info for the service/ app and all of its routes.
            - [x] Display app
            - [x] Display routes
    - [x] remove (Remove the service from FN)

- [ ] April 17th demo serverless.
