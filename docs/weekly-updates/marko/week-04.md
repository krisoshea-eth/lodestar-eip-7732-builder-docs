# EPF7 - Week 4 Update

## Finishing up the proposal
This week's focus was mainly on the proposal and presentation preparation.
Kris and I have applied to present on Wednesday of week 5.
Our proposal is development of EIP-7732(ePBS) builder with stretch points tackling Deathstar (Lodestar adversarial node) and FOCIL/Heze adaptation of the builder.
Proposal PR is up, and almost ready to be merged:
https://github.com/eth-protocol-fellows/cohort-seven/pull/161
After multiple iterations on things we are about where we want to be, with still having the extra time to polish everything for the presentation day.

### Decentralized checkpoint sync
I really tried fitting some decentralized checkpoint sync work into the flow - I wrote about that in some of the previous updates.
Just so no threads are left dangling for update readers, I have cancelled any work on it - it is too much of a focus shift, especially considering that multiple scope expansions have appeared organically, ones that build on the context we already have and are well worth doing.
I will try to follow up on the work of others in this domain - just to see what the final solution looks like.

## Lodestar focused work
Lately, I've been looking through Gloas related issues in hope to get myself up to speed for the builder development.
This week I handled some simple but rather interesting topics:
- [feat: implement compute_weak_subjectivity_period for Gloas (EIP-8061)](https://github.com/ChainSafe/lodestar/pull/9625) (awaiting review)
- [feat: add state.getBuildersLength() binding](https://github.com/ChainSafe/lodestar-z/pull/472) (merged)
- [fix: proposer preferences race condition](https://github.com/ChainSafe/lodestar/pull/9613) (merged)
- [chore: dedup caches in favor of ProposerPreferencesPool](https://github.com/ChainSafe/lodestar/pull/9605) (merged)
- [feat: add chain.targetGasLimit](https://github.com/ChainSafe/lodestar/pull/9622) (closed - design decision)

In addition to these, I reviewed a couple of PRs and participated in some Gloas related discussions. I also assessed a few issues without writing code yet.

One of the more memorable things that I worked on, mentioned in a previous update, is the `head_v2` event implementation per Gloas spec. While the event payload itself is simple, the emission semantics are not settled.
My initial implementation is resting as a draft for that exact reason:
- [feat: implement head_v2 event](https://github.com/ChainSafe/lodestar/pull/9486)

Nico from the Lodestar team asked me to represent Lodestar in the discussion happening on #interop, in the Eth R&D Discord server.
In the meantime I have inspected the implementation of Teku to get a better understanding of the scenarios in which this event is emitted, which led to the discovery of a small bug:
Reading the Teku implementation, `head` (v1) and `head_v2` events appear to be bundled at the same emission point. This is an issue because `head_v2` is emitted on each change of the head's `payload_status`, which means the v1 `head` event is re-emitted for the same head block - where consumers expect a single emission per head.
- [Head event bundle location - Teku](https://github.com/Consensys/teku/blob/c905b16ae7f08634793f318442b5c0cbea2d41d3/data/beaconrestapi/src/main/java/tech/pegasys/teku/beaconrestapi/handlers/v1/events/EventSubscriptionManager.java#L142-L190)

I have messaged on a dedicated thread about this matter.

## Next week

In week 5, which has already started by the time I am writing this update, I hope to properly deliver the presentation that Kris and I worked on, decide on the initial development approaches so that we can start coding by week 6, and progress further with the `head_v2` spec settlement/implementation - though I am aware this last part is not fully up to me, so I am hoping for the best.