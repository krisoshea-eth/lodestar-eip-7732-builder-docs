# Builder implementation status

Checked against GitHub on 4 October 2026. This page supersedes the PR-status tables in older plans and audits; it does not replace their design history.

## Current work

| Work                         | PR                                                                  | Boundary                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gloas Engine connection      | [Lodestar #10234](https://github.com/ChainSafe/lodestar/pull/10234) | One JSON-RPC endpoint, existing JWT/client/codecs and per-request cancellation. Heze Engine transport is deliberately deferred.                                       |
| Gloas bid and reveal runtime | [Lodestar #10247](https://github.com/ChainSafe/lodestar/pull/10247) | Opt-in `Builder.init` wiring, branch-correlated inputs, retained payloads, exact local selection and prompt reveal within an explicit cutoff. The source is injected. |
| Skip unrelated block fetches | [Lodestar #10257](https://github.com/ChainSafe/lodestar/pull/10257) | Filter foreign/self-build events before fetching; still fetch matching and legacy events. Legacy decoding is client-only, not a weaker producer schema.               |
| Simulation head wait         | [Lodestar #10237](https://github.com/ChainSafe/lodestar/pull/10237) | Test-only correction using the current event's slot. It is not being reapplied to merged bid-publication code.                                                        |

All four PRs above are ready for review. #10234, #10247 and #10257 were promoted after the 4 October review; their full workflows require maintainer approval. #10237 already has successful hosted tests, simulations and docs checks.

The source, orchestration, store, policy, ledger, preference tracker, bid assembly/publication, selection, envelope assembly/publication and shared event subscription have merged. Their old component drafts are no longer the delivery queue.

Fork [#61](https://github.com/krisoshea-eth/lodestar/pull/61) is closed as completed. Fork [#80](https://github.com/krisoshea-eth/lodestar/pull/80) and upstream [#10109](https://github.com/ChainSafe/lodestar/pull/10109) are superseded by merged [#10243](https://github.com/ChainSafe/lodestar/pull/10243). Fork [#77](https://github.com/krisoshea-eth/lodestar/pull/77) remains an integration reference, not another PR to promote wholesale. The broader store proposal #63 is closed, and contributions on Marko's fork #9/#10 are incorporated.

## Draft follow-ups

1. **Engine/CLI configuration, [#10259](https://github.com/ChainSafe/lodestar/pull/10259).** The six-file contribution uses #10234's factory with #10247's runtime. Bidding stays disabled by default. Enabling it requires an Engine URL, JWT secret, policy parameters and explicit build/reveal timing. A failed `Builder.init` cleans up resources already started by the handler. Review this separately from preference recovery.
2. **Preference startup/reconnect recovery, [#10260](https://github.com/ChainSafe/lodestar/pull/10260).** The eight-file contribution uses Nico's proposed [#10255 endpoint](https://github.com/ChainSafe/lodestar/pull/10255) and #10247's consumer, not a competing API. Subscribe before fetching the snapshot, preserve live entries, discard expired/stale results and cancel active inputs when the transport disconnects. Transient snapshot errors have bounded retries, with nested API-client retries disabled; unsupported endpoints and decoding errors remain visible.

Both are published drafts with unmerged dependencies. Their descriptions link the contribution-only commits because the full upstream diff also includes parent work. In separate checkouts, CLI validation passed 117 targeted tests and recovery passed 105, with relevant ordinary package checks, builds, imports and lint. These suites overlap and are not unique lifecycle scenarios. Recovery does not replay missed blocks or heads and does not restore the in-memory ledger after restart. Endpoint standardization is tracked separately in [Beacon APIs #659](https://github.com/ethereum/beacon-APIs/pull/659).

## Input and deployment rules

- Use the fork-specific finality fields from merged #10243. Do not substitute zero hashes or mix them with independently sampled latest state.
- Custody remains `null` in the accepted Builder source. No separate Builder custody service is required.
- Correlate head, payload attributes and proposer preferences before building. The first runtime supports Gloas head-parent builds; it does not invent Heze inclusion-list bid bits.
- Record an exact selected bid before checking retained payload availability or publishing. Failed reveal does not erase the recorded obligation.
- Prompt reveal is the Lodestar default within the configured cutoff. No attestation threshold is introduced by the event proposal.
- Following BN attributes does not serialize two FCU writers. Shared-EL production safety is not established. Keep the initial deployment isolated and pin its topology and client revisions.

The [input contract](builder-input-contract.md) describes the implementation boundary in more detail.

## Validation and remaining delivery work

Fresh targeted tests cover the event decoder/filter, Engine connection and composed Gloas runtime. The Engine has separate historical pinned-Geth smoke evidence, with an empty payload. Neither that smoke test nor mocked BN/Engine tests establishes a complete bid, selection, reveal and payload-import lifecycle.

The existing [ENV-02 runbook](runbooks/env-02-builder-dev.md) qualifies API-02 observation, not this full lifecycle. A new pinned run needs the runtime and CLI changes, a registered active Builder, matching CL/EL fixtures, and a proposer BN receiving the published bid over p2p. Preserve the separate publishing/proposing BN topology introduced by #9998. Independent ENV-02 outreach remains paused.

Recent BN work on range-envelope identity (#10251), sync backoff (#10249/#10250/#10252), cache eviction (#10246) and circuit-breaker diagnostics (#10254) belongs in the runtime qualification matrix. It is not a reason to duplicate those fixes in Builder services. #10258 removes unused payload-body V1 methods; the Builder adapter uses FCU V4 and getPayload V6, not the removed methods.

Publication retries (LOD-107), signer overload cleanup (LOD-109), exact uint64 codecs (LOD-105) and multi-BN publication (LOD-37) remain separate. A timeout does not prove a bid was never broadcast; do not clear its reservation indiscriminately. Multi-BN work follows a demonstrated single-source-BN lifecycle.

Payment reconciliation is tracked in [LOD-112](https://linear.app/kriso/issue/LOD-112), under LOD-78. The runtime records selected liabilities but does not yet observe payment settlement. A refreshed balance can therefore still have an already-paid local liability deducted again, and unsettled winning records survive pruning. This is a limitation for sustained bidding. The follow-up needs coherent state and canonical outcome evidence; elapsed time, queue absence, a balance delta or successful reveal alone must not release a reservation.

## Beacon API specification

[SPEC-01 / Beacon APIs #641](https://github.com/ethereum/beacon-APIs/pull/641) is open and ready for review. Lodestar's extended block event has merged, but that does not establish cross-client agreement. The lightweight alternative remains linked. The wire contract describes inclusion, not a mandatory reveal policy. No new specification or Discord post was made for this reconciliation.
