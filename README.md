Start of MVP Serverless Integration for fn.

Initial MVP:

Use fn biniary and just exec out functionality from node sls cli.

- sls deploy (fn deploy)
- sls package (fn build)
- sls info (fn apps / routes this is for info about deployed service so maybe detect what svc / app and auto do inspect on that one.)

Doing this will provide a small taste of FN through Serverless.
The issue I see with this are the following:

- fn deploy also does fn build so sls deploy would call fn build and then fn deploy.. Might be a way for the package step to be skipped in serverless not sure.
- User sees raw output of the fn deploy command which feels wierd and makes sls not really useful.
- Makes it difficult to add in the different flags etc...
- Not maintainable.
- serverless uses a service.yml which has a different format than func.yaml and app.yaml.


Should we move forward with mvp as described or should we do full on integration with serverless?


If I move forward need to know how to handle the yaml differences as right now you need both a serverless.yml and a func.yaml which feels weird and super clunky even for an mvp.  


After talking with travis it seems he thinks that we should go with mvp doing the proxying...

Inorder to do that need to make a decision on these things:

- Do we use our yaml files or a serverless yaml? (They will need a serverless yaml regardless so I think it should be serverless yaml)
    - Assuming we use serverless yaml how do we get fn cli to work if there are no func yamls..
