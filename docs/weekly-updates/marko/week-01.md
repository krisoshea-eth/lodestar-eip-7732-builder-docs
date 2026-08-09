## EPF7 - Week 1 Update
### Initial high level plan for the week
- Thoroughly inspect the client team proposals :white_check_mark:
- Narrow down the scope of interest to a couple of proposals :white_check_mark:
- Investigate topics outside of what is proposed by the projects that I have interest in :white_check_mark:
- Properly manage existing open-source work :white_check_mark:

### Topic Research
Upon digging into the topics proposed by the client teams, I have scoped out 3 that make the most sense to go for. Two are listed as the project proposal by client teams and the third one is not.

Listed
- Decentralized checkpoint sync (multi-client)
- ePBS EIP-7732 Builder implementation (Lodestar)

Unlisted
- Lodestar BeaconEngine in Zig (Lodestar)

### Details of each topic

#### Decentralized Checkpoint Sync
Decentralized checkpoint sync is a topic of great value when it comes to network security. At the moment it is not scoped out very well but it is very much worth getting into due to its high value for the Ethereum ecosystem. This needs to be implemented in a multitude of clients, though I would choose Lodestar as it is the most familiar environment for me, trying on others would be fun as well though.

#### ePBS EIP-7732 Builder
In contrast to DCS, builder is a really well-scoped proposal to deal with. It has my interest due to being a new piece of infrastructure. Also, I haven't had a chance to build such a thing before. Think this one is a good time investment that brings value to the ecosystem.

#### Lodestar BeaconEngine modules in Zig
Lodestar has started to move more BeaconEngine logic to Zig and behind the JS facade. I am an amateur in Zig and have previously contributed to the lodestar-z and zeam repositories. This is a great chance for me to improve my knowledge and make valuable contributions there. Since this is a place of high risk and a lot of critical paths, it will probably not reach the point of being my primary choice but I would like to try helping out on the side of whichever main project that I choose for the proposal.

### Open Source Work
This week I managed to merge a couple of open PRs that I had before and make some new additions across lodestar, lodestar-z and zeam. I am hoping to continue following the existing flow throughout the cohort but it all depends on the complexity of the final proposal.

Here are some of them:
- [Zeam: add stress lock contention mode to stress testing](https://github.com/blockblaz/zeam/pull/896)
- [Lodestar: implement `head_v2` event](https://github.com/ChainSafe/lodestar/pull/9486)
- [Lodestar-z: remove merge transition code](https://github.com/ChainSafe/lodestar-z/pull/359)

### Plan for the next week
Next week I would like to broaden my understanding of other proposals that I consider very interesting aside from my primary choice(s) and the EIPs behind them. Some of them are:
 - SSZ Query Language for the Consensus and Execution Layers
 - FOCIL
 - Optional Execution Proofs
 - Partial Statefulness
 - Syncing from Non-Finalized Checkpoints
 - Lodestar adversarial node

When things clear out and I gather the knowledge that I need, I will start carving out the scopes of what interests me the most out of these topics, I assume that will be in week 3 though.