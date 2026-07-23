# EPF 7 Week 0 Update — Exploring Reth Partial Statefulness

## Intro

Hi, I’m Kris, an Irish software developer based in Dublin, Ireland. I’ve been involved with the Ethereum ecosystem since late 2017, and I started working more directly on the app layer in 2022.

Most of my recent work has been around prediction markets, synthetic assets, and truth-discovery mechanisms. I worked with a team on [Sumero][sumero], a synthetic assets protocol, and later on [Olena Protocol][olena], a peer prediction protocol.

Olena’s peer prediction work is influenced by mechanisms like [Bayesian Truth Serum][bayesian-truth-serum] and the [surprisingly popular][surprisingly-popular] answer method. The rough idea is that people do not only report what they believe; they also predict what others will believe. That second-order prediction can reveal useful information about which answers are more informed than they first appear.

For EPF7, I want to move much deeper into the protocol and execution-client layer.

## Focus for the cohort

The project I am currently most interested in is the Reth team’s [Partial Statefulness and State Expiry Prototype][epf-reth-project].

My current understanding is that the project asks whether a Reth node can remain useful while storing only part of the live execution state. More concretely, the node would retain account-level state while selectively retaining storage and bytecode for configured contracts or state ranges.

The correctness requirement that stands out to me is that missing state should be explicit. A partial-state node should not silently treat unavailable storage as zero, unavailable bytecode as empty bytecode, or an untracked account as a known absent account.

I’m interested in this project because it touches several areas I want to understand deeply: execution-client storage, sync, RPC semantics, txpool validation, state-root correctness, and current protocol work around [block-level access lists][eip-7928], [VOPS][vops], and [FOCIL][eip-7805].

I have not finalized the exact project scope yet. This feels like a large project area rather than a single well-contained task as it touches several parts of the Reth codebase, and the relevant protocol work is still moving quickly. My first goal is to understand the design space well enough to break the project into smaller areas / categories, then research each individual area, draft a project scope and try to build a prototype that is realistic achieve over the course of the fellowship.

## What I have looked at so far

The closest existing implementation I have found is the draft [Geth partial-state PR][geth-partial-state-pr]. My understanding is that the Geth prototype stores all accounts, but only syncs and tracks storage and bytecode for a configured set of contracts. It also adds awareness at the RPC layer so methods like `eth_getStorageAt`, `eth_getCode`, `eth_call`, and `eth_estimateGas` return clear errors for untracked state instead of silently returning zero or empty values.

One issue from the Geth work that seems especially important is state-root correctness. If a partial node does not store the storage trie for an untracked contract, then even if it receives a BAL with the post-value of a changed storage slot, it may not be able to compute the new storage root for that contract. The Geth PR notes that missing contract storage roots had to be requested separately through snap sync because they do not come with the BAL.

This appears to be exactly the gap that [EIP-8268: Storage Roots in Block Access Lists][eip-8268] is trying to address. My current understanding is that EIP-8268 extends EIP-7928 by adding post-block storage roots to BAL entries for modified accounts. If that direction is adopted, a partially stateful node could reconstruct modified account leaves without holding every modified account’s full storage trie. I still need to understand the tradeoffs here, but this seems like one of the key protocol dependencies for making partial statefulness root-correct rather than just locally useful.

I also looked at Erigon’s related [partial-statefulness tracking issue][erigon-partial-state]. Erigon’s approach appears to diverge from Geth because Erigon does not use devp2p snap in the same way. Instead, the plan is to use sparse domain files served on demand over BitTorrent. That is useful context because it suggests that “unavailable locally” does not always have to mean “unavailable forever”; it could also mean “not local, but fetchable from another source.”

The Reth side is different again. Reth has its own architecture, and recent releases have added a lot of BAL-related infrastructure. The latest public release I am looking at is [Reth v2.3.0][reth-releases], which continues the Amsterdam / Block Access List rollout with expanded BAL validation, storage, networking, RPC, and payload-builder support. Reth v2.2.0 also added earlier groundwork such as a BAL store abstraction, P2P support for fetching BALs, payload-builder integration, parallel/batched BAL execution paths, and `snap/2` helpers.

[Reth 2.0][reth-2] is also clearly very relevant. It made Storage V2 the default for new nodes and introduced the newer storage architecture, Sparse Trie Cache, and Partial Proofs. I still need to understand the code properly, but my current assumption is that any partial-state prototype in Reth will have to touch the storage/provider, execution, trie/state-root, and RPC paths.

## Current questions

I am trying to turn the project into a concrete set of questions and areas to research rather than jumping straight to a proposed solution.

The first questions I want to answer are:

- Where does Reth currently read account state, storage, and bytecode?
- Where could missing state currently be interpreted as default zero or empty data?
- How should a partial-state node distinguish between known zero storage, unavailable storage, known empty bytecode, unavailable bytecode, and a known absent account?
- How much of the Geth approach transfers to Reth, and how much is specific to Geth’s sync/storage architecture?
- What does [EIP-7928][eip-7928] make possible, and where does it fall short for partial-state nodes?
- What parts of this can be implemented locally in Reth, and what parts would require protocol support?

The state-root question is the one I currently find most interesting. [EIP-7928][eip-7928] records accounts and storage locations accessed during block execution, along with post-execution values. That seems very useful for retained-state updates and executionless state updates. But if a node does not store the full storage trie for a modified account, slot-level post-values alone may not be enough to recompute the account’s new storage root.

That is why [EIP-8268][eip-8268] looks quite relevant to this project. As mentioned prior, my understanding is that it extends EIP-7928 by adding post-block storage roots to BAL entries so partially stateful nodes can reconstruct modified account leaves without holding every modified account’s full storage trie.

## Possible directions

I do not want to lock the project scope yet, but I currently see a few possible areas that need to be covered or researched before moving ahead:

- mapping partial-state assumptions onto Reth’s storage, provider, execution, txpool, RPC, and trie/state-root architecture;
- defining how unavailable state should behave at the provider / EVM / RPC boundary;
- prototyping RPC behavior for `eth_getStorageAt`, `eth_getCode`, `eth_call`, and `eth_estimateGas` when state is unavailable;
- defining whether a partial-state Reth node can serve `eth_getProof` for all accounts, only tracked contracts, or only retained storage;
- studying whether a partial sync mode could store all accounts but skip storage and bytecode for untracked contracts;
- understanding how BALs, storage roots, proofs, or witnesses could keep retained state updated and root-correct;
- looking at what account-level state is enough for VOPS / FOCIL-style nonce and balance validation;
- measuring disk usage, sync behavior, and RPC behavior for different tracked-state configurations.

One thing I want to check early is whether there are places in Reth where a missing value currently becomes zero or empty by default. That seems like the kind of behavior that would be dangerous in a partial-state mode. This seems like a central correctness issue.

## Related protocol work

The main EIP I am trying to digest and understand at the moment is [EIP-7928: Block-Level Access Lists][eip-7928]. BALs record accounts and storage locations accessed during block execution, along with post-execution values. They are intended to help with parallel disk reads, parallel transaction validation, parallel state-root computation, and executionless state updates.

I am also reading [VOPS][vops] and [FOCIL][eip-7805]. The connection, as I currently understand it, is that retaining account-level state may still be useful for nonce and balance checks even if the node cannot fully execute arbitrary contract interactions. That seems relevant for mempool pruning, inclusion lists, and censorship-resistance research.

Further, I want to understand [Ress / Stateless Reth][ress] and the [Portal Network][portal-specs] better. Ress does not have the same goals as this project, but it is relevant because it explores Reth-adjacent stateless execution using witnesses and Merkle proofs. Portal is relevant as a possible future direction for retrieving state that is not stored locally.

## Next steps

Over the next few weeks, I want to iron out and map the project scope more. Here is what I initially intend to do to get up to speed:

1. Build and run the latest Reth locally.
2. Trace the code paths for `eth_getCode`, `eth_getStorageAt`, `eth_call`, and `eth_estimateGas`.
3. Read the Geth partial-state PR more carefully and summarize what is portable to Reth.
4. Read the Erigon sparse snapshot plan and understand how its assumptions differ from Geth and Reth.
5. Map where Reth reads account state, storage, bytecode, and proofs.
6. Write down the exact state-root correctness problem and compare EIP-7928, EIP-8268, snap/snap2 fetching, witnesses, and local prototype assumptions.
7. Talk to mentors and other fellows interested in this project so the work can be split sensibly rather than duplicated.

By the next update, I’d like to have a clearer Reth code-path map and a better sense of what each part of this project is comprised of.

## References

- [Sumero][sumero]
- [Olena Protocol][olena]
- [Bayesian Truth Serum][bayesian-truth-serum]
- [A solution to the single-question crowd wisdom problem][surprisingly-popular]
- [EPF7 project idea: Reth partial statefulness][epf-reth-project]
- [Reth releases][reth-releases]
- [Releasing Reth 2.0][reth-2]
- [EIP-7928: Block-Level Access Lists][eip-7928]
- [EIP-8268: Storage Roots in Block Access Lists][eip-8268]
- [EIP-8268 Magicians discussion][eip-8268-magicians]
- [Geth partial-state prototype][geth-partial-state-pr]
- [Erigon partial-statefulness tracking issue][erigon-partial-state]
- [VOPS: A pragmatic path towards Validity-Only Partial Statelessness][vops]
- [EIP-7805: FOCIL][eip-7805]
- [Ethereum roadmap: Statelessness, state expiry and history expiry][ethereum-statelessness]
- [Ress / Stateless Reth][ress]
- [Portal Network specs][portal-specs]

[sumero]: https://sumero.finance/sumero-the-world-mint/
[olena]: https://peerprediction.olena.xyz/
[bayesian-truth-serum]: https://www.science.org/doi/10.1126/science.1102081
[surprisingly-popular]: https://www.nature.com/articles/nature21054
[epf-reth-project]: https://github.com/eth-protocol-fellows/cohort-seven/blob/main/projects/project-ideas.md#reth-partial-statefulness-and-state-expiry-prototype
[reth-releases]: https://github.com/paradigmxyz/reth/releases
[reth-2]: https://www.paradigm.xyz/2026/04/releasing-reth-2-0
[eip-7928]: https://eips.ethereum.org/EIPS/eip-7928
[eip-8268]: https://eips.ethereum.org/EIPS/eip-8268
[eip-8268-magicians]: https://ethereum-magicians.org/t/eip-8268-storage-roots-in-block-access-lists/28585
[geth-partial-state-pr]: https://github.com/ethereum/go-ethereum/pull/33764
[erigon-partial-state]: https://github.com/erigontech/erigon/issues/20587
[vops]: https://ethresear.ch/t/a-pragmatic-path-towards-validity-only-partial-statelessness-vops/22236
[eip-7805]: https://eips.ethereum.org/EIPS/eip-7805
[ethereum-statelessness]: https://ethereum.org/en/roadmap/statelessness/
[ress]: https://github.com/paradigmxyz/ress
[portal-specs]: https://github.com/ethereum/portal-network-specs