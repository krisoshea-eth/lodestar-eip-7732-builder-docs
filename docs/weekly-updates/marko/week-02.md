# EPF7 - Week 2 Update

This week I have spent time researching less familiar proposals (SSZ QL, FOCIL, etc.), deepening the knowledge about ones that interest me the most (ePBS builder & decentralized checkpoint sync), participating in the discussion on EIP-8282 which is ePBS builder related, made a logging module in Zig for Lodestar and a couple of cleanup PRs.

One of the goals that I have now is to figure out which proposal should become my primary work, and see if there are others where I can contribute on the side.

## Details of this Week's Work

### Per proposal notes

Investigation of unfamiliar proposals is mandatory to understand the current state of the ecosystem and the importance given to each project at the time. Also, knowing the cross-relations between various EIPs/project proposals is nice to wrap your head around before dedicating to (a) particular topic(s).

#### FOCIL
Here I am giving FOCIL the highest priority due to its relation with ePBS. The security that FOCIL provides is mandatory to exist in parallel with all ePBS changes, to preserve censorship resistance. I would like to contribute to it and follow up relevant discussions if time allows.

#### SSZ Query Language
This is one of the most interesting project ideas in my opinion. Very research oriented, feedback-seeking, requires a lot of communication with relevant people I suppose. Very useful feature and I like that it seemingly includes a lot of work with Merkle trees. For the fellowship one of my goals is to increase understanding of cross-node-communication and understand how different roles overlap and work together - so for now I will skip working on this one.

#### Optional Execution Proofs
Another very interesting one, leaning on ePBS for extended validation window. Maybe it is too far ahead to work on now - in any case I feel like taking a ZK topic might be a too large of a bite for me. It correlates with ePBS in a way, but its direction and required skillset are quite different.

#### Adversarial Node
Adversarial node proposal, deathstar by Lodestar is an interesting tooling project. Currently my focus is not on tooling but rather on protocol-integrated architecture pieces so I tend to skip this one as well. Also it seems to be a quite time consuming project so I am not sure how well would it go if done together with builder.

#### ePBS Builder - Main topic
Currently the main topic. I've had a chance to talk to another fellow interested in it - Kris. After deepening our knowledge we will be able to start writing the proposal in week 3.
We discussed potential extension of the proposal to either FOCIL or Lodestar adversarial node - deathstar. Currently I'm in favor of working on FOCIL.

#### Current Proposal Status
Haven't found anyone interested in decentralized checkpoint sync on Lodestar for the time being. Since Kris and I agreed to work on the builder together, we should start creating the proposal about it and then decide on the second topic (as previously mentioned).

### Other Work

#### EIP-8282
For some time now I got to participate in the EIP-8282 discussion with the Lodestar team. I had a couple ideas, did some smart-contract auditing in Solidity and geas and made one minor contribution to the EIP itself in a form of a test.

The EIP can be found here, it is not merged yet:
- [EIP 8282 Official PR](https://github.com/ethereum/EIPs/pull/11760)

I consider it particularly valuable because it relates to my ePBS related work.

#### Zig Logger - Lodestar
As soon as Lodestar announced the migration of further logic to Zig I wanted to help out on something, even the simplest.
That is why I tried building a logger module, a very basic one. I used existing Lodestar logger and Zeam logger as references to make this one.

It is awaiting review for the moment:
- [Lodestar Logger in Zig](https://github.com/ChainSafe/lodestar-z/pull/446)

#### Feature Cleanups - Lodestar
When I was reading through the Lodestar PRs I noticed a couple of simple cleanup issues that are helpful but not mentally exhausting, so I thought it is nice to cover those things in the meantime:

- [Align gas limit types with reasoning](https://github.com/ChainSafe/lodestar/pull/9528)
- [Remove V1 attestation endpoints](https://github.com/ChainSafe/lodestar/pull/9531)
- [Remove V1 block publishing](https://github.com/ChainSafe/lodestar/pull/9532)
- [Forward broadcast validation in `publishBlindedBlockV2`](https://github.com/ChainSafe/lodestar/pull/9535)