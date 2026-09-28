# Builder catch-up, 28 September 2026

## Current code

- #9973 now checks the preparation delay immediately before scheduling, including a backwards-clock regression. Pushed head `d1d06a3f3`; 31 orchestration and 11 source tests passed with Builder package checks.
- #9981 remains open. It now compares retained material with the selected bid's Builder index, ordered blob commitments and execution requests root. Pushed head `e51e98f6a`; 12 envelope and four store tests passed with package checks. This does not add EL or KZG validation.
- Fork #77 is pushed at `dab18e5316`. Its source matches merged #9958, the accepted store/policy behavior is retained, and the approved timer/gas/envelope checks are incorporated. All 312 Builder tests and package checks passed.
- The existing input-consumer branch is pushed at `c82a486ec4`. Configurable custody input was removed; the accepted source supplies null. Opt-in Builder startup and selection/reveal wiring remain, and the full selected bid now reaches envelope assembly. All 374 Builder tests and package checks passed with mocked Engine/BN boundaries.

Seven upstream PRs are non-draft: #9973, #9978, #9979, #9980, #9981, #9982 and #10064. This is their GitHub state, not a claim that all review feedback is complete. #10109 and fork #80 remain draft. Fork #77 remains a combined integration draft. #61 uses the same branch as #9973 but its old base no longer supplies a clean two-file comparison. #63 and Marko-fork contributions #9/#10 are closed or merged.

## Reviews and remaining changes

The approved gas-limit, timer, envelope-boundary and zero-finality-hash replies were posted. New #9978 feedback on inclusion-bit length, authoritative prevRandao and ForkPostGloas needs its own scoped amendment. The short/long inclusion-bit serialization behavior was reproduced. Marko's #9980 suggestion to group selection into reveal deserves a boundary discussion, not blindly deleting local ledger accounting. #10064's optional service extraction remains separate from its existing error handling.

Full uint64 gas-limit support is tracked in [GitHub #111](https://github.com/krisoshea-eth/lodestar/issues/111). The existing safe-integer guard prevents signing rounded values; it does not replace an exact-width Engine/type migration.

## Upstream impact

- Merged [#10089](https://github.com/ChainSafe/lodestar/pull/10089) deduplicates finalized BN envelope storage and reconstructs bodies from the EL. It does not replace the Builder PayloadStore. EL outage, pruned BAL and reconstruction mismatch belong in lifecycle/serving evidence.
- Marko's draft [#10192](https://github.com/ChainSafe/lodestar/pull/10192) owns naming, metrics, CLI-help and dashboard follow-ups. Re-compacting envelopes originally stored in full remains excluded.
- Merged [#10150](https://github.com/ChainSafe/lodestar/pull/10150) supplies a useful Builder startup smoke harness, not successful bidding/reveal evidence.
- [#10155](https://github.com/ChainSafe/lodestar/pull/10155) proposes an SSZ-REST Engine transport. Inspect its supported methods and cancellation behavior before sharing transport code; it is not proven EL interoperability.
- Nico's [#10189](https://github.com/ChainSafe/lodestar/pull/10189) and Beacon APIs #655 add pending-payment/withdrawal queries. #10180 changes payment processing order. Neither an open endpoint proposal nor a pending payment proves settlement.
- #10134/#10144 make competing roots and late-payload recovery important test cases. #10154 advances the spec baseline; a merge is not release or deployment evidence.
- [#10197](https://github.com/ChainSafe/lodestar/pull/10197) addresses incremental PTC duty merging with a clock-driven regression. Do not duplicate its existing finding.

## SPEC-01

Nico approved [Beacon APIs #641](https://github.com/ethereum/beacon-APIs/pull/641) on 26 September and left it open for other client approvals. He considers a separate reveal-trigger event independent of this change. He also says Lodestar Builder can reveal on receipt because it has no unbundling risk. Record that as concrete Lodestar reveal-policy guidance, not an agreed cross-client threshold or permission to remove consistency/cancellation checks. No Beacon APIs reply or wire-patch change was made in this reconciliation.

## Next implementation

1. Resolve the new bid-assembly review questions and selection/reveal grouping.
2. Settle coherent parent/safe/finalized inputs and the supported EL deployment. Geth's zero-hash handling does not by itself establish a portable Builder contract or remove competing FCU writers.
3. Reuse existing JWT, RPC, Engine serialization and configuration utilities for concrete construction, preserving per-operation abort behavior and null custody serialization.
4. Add startup/reconnect recovery and the agreed reveal/settlement/eviction policy to the existing experiment.
5. Run a pinned real Gloas lifecycle, including nonzero blobs, competing roots, missed deadlines and shutdown.

## Tracking and evidence limits

Affected GitHub issues and Project entries were refreshed; Marko's #10192 is tracked under STORAGE-02 and assigned to him. LOD-76/77/78's GitHub mirrors remain assigned to Kris. Linear repeatedly returned an authentication loop, so its new gas-limit issue and synchronization remain pending. Cached Linear status fields for the completed smoke and dedup issues still disagree with GitHub Done. Do not claim a synchronized board from the GitHub updates alone.

New-head hosted checks on #9973/#9981 currently show title validation only. There was no real BN/EL run, no CodeRabbit review, no routine unstable merge or force push. ENV-02 outreach remains paused. The source audit was focused on changed Builder-relevant code and review feedback, not an exhaustive audit of every unrelated Lodestar PR.
