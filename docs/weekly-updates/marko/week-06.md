## EPF 7 - Week 6 Update

This week I started working on the Lodestar builder.

Previously, Kris created an extensive plan of what needs to be done, documenting tasks and important design decisions that we made earlier.

We are currently awaiting confirmations from the team that all the approaches are sound.
Still, there is a lot of work that we can do even before the confirmation.

### Done this week

I started by setting up the package, using `@lodestar/validator` as a structural reference.

In line with it, I initialized the package and added the scaffolding in terms of initial dirs and files, the CLI as well.

Once everything was in place I was looking for a simple feature that can help me make the actual wiring.
There is a pretty isolated flow for signing the execution payload envelopes and bids, so that seemed like a good fit.

I made that flow into a slim `builderSigner` service:
https://github.com/markolazic01/lodestar/blob/30de4886dcc3d132b0e206e7f87c0551e4c77dff/packages/builder/src/services/builderSigner.ts

Once it was in place, that marked a good moment to wire it to the `Builder`:
https://github.com/markolazic01/lodestar/blob/30de4886dcc3d132b0e206e7f87c0551e4c77dff/packages/builder/src/builder.ts

After wiring, I was looking to establish a first fully functional path: cli -> handler -> builder (with signer).
So I went towards keystore loading using cli arguments `--keystore` (keystore file location) and `--keystorePassword` (location of the file containing the password for the keystore).
https://github.com/markolazic01/lodestar/blob/30de4886dcc3d132b0e206e7f87c0551e4c77dff/packages/cli/src/cmds/builder/options.ts
This required a keystore loading flow:
https://github.com/markolazic01/lodestar/blob/30de4886dcc3d132b0e206e7f87c0551e4c77dff/packages/cli/src/cmds/builder/signer.ts
(I'm supposed to change the file name, ik)

Furthermore, once the keystore loading and cli options are present and working, they're supposed to be wired up via handler:
https://github.com/markolazic01/lodestar/blob/30de4886dcc3d132b0e206e7f87c0551e4c77dff/packages/cli/src/cmds/builder/handler.ts
And that makes the whole functioning path.

I also added tests for the signing flow and the keystore loading, and a couple of other necessary package files.

Everything can be seen in this permalink-diff:
https://github.com/ChainSafe/lodestar/compare/4001398810453c5c1b4abe8c06323a76d0ba592f...markolazic01:lodestar:30de4886dcc3d132b0e206e7f87c0551e4c77dff

This clears up `CLI-01` and `SIGN-01` tasks from our shared task list.

### Code info / disclaimer
All the code is hand-written, and permalinks are from the moment of writing this article.

I usually run my code with context through Claude to see if there are weak points and to gather insights.

I started working on a local branch as that was most convenient at the moment, but the code will soon be merged into a shared repo of Kris and myself: https://github.com/krisoshea-eth/lodestar

### Some work for the soul
A while ago I was looking at issues on the OpenZeppelin repo. As someone with many years in smart-contract development, I've always wanted to make a meaningful contribution there.
I noticed that there is an open issue for an `SSTORE2` library, and that is something people use for cheap permanent storage - it works by embedding the data into contract bytecode and deploying it to an address using `create` or `create2`.

I'm not gonna talk too much about it, and there isn't really that much to say - but I made this PR, hope to get some feedback on it:

https://github.com/OpenZeppelin/openzeppelin-contracts/pull/6625

### Next week
In the following week I need to follow up on the current status of the repo, PRs and everything to see the direction and proceed further.

I will make a PR to the shared repo for Kris and mentors to review.

New tasks I want to tackle are `API-01` and `ENV-01`.

`API-01` -> Implement the typed source-BN client and active-Builder resolver.
`ENV-01` -> Create the deterministic local Gloas/Kurtosis environment.

I will be glad if either of these is done by the end of the week.
Looking forward to a plan sign-off from the team.