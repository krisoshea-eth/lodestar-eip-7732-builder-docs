# Builder reconciliation, 22 September 2026

## Review and implementation

The catch-up read conversations and inline reviews across eight open Lodestar PRs, three open fork PRs, the recently merged foundations, merged contributions on Marko's fork, Beacon APIs 641 and docs 31. It also screened 172 Lodestar PRs updated since 14 September for relevant changes. This was a focused review of current feedback and affected code, not a new exhaustive audit of every unchanged diff.

| PR                 | Current disposition | Work in this pass                                                                                                          |
| ------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 9958               | Merged 16 September | Reuse accepted post-Gloas source and null custody input                                                                    |
| 10054              | Merged 14 September | No outstanding rerun or source work                                                                                        |
| 9973 / fork 61     | Ready               | `80a9a3ae85` rejects unsupported timer delays and bounds deadline waits                                                    |
| 9978               | Ready               | `b96874a877` rejects unsafe numeric gas limits before assembling a bid                                                     |
| 9981               | Ready               | `be71afad60` accepts actual store records, documents the selection precondition and removes duplicate inherited-type tests |
| 9979 / 9980 / 9982 | Ready               | No new source correction from this feedback pass                                                                           |
| 10064              | Ready               | Fetched head has successful hosted tests, E2E and simulation checks                                                        |
| 10109 / fork 80    | Draft               | Finality-hash and zero-hash contract remains under discussion                                                              |
| Fork 77            | Draft               | No new comments; accepted dependency reconciliation and actual runtime qualification remain                                |
| Fork 63            | Closed              | Superseded by merged store 9970, not proof the broader hardening was accepted                                              |
| Marko fork 9 / 10  | Merged              | Test-only store and arithmetic policy contributions incorporated upstream                                                  |
| Beacon APIs 641    | Ready               | `ebeeb92` follows Nico's concise wording, example and changelog feedback                                                   |

Seven of the eight open Lodestar PRs were already out of draft. No draft-state change, routine unstable merge or force push was needed. Replies are prepared for approval; none was posted in this pass.

## Validation

- Orchestration/source: 41 focused tests passed, including two regressions that failed before the timer fix.
- Bid assembly/source: 28 focused tests passed, including six gas-limit regressions that failed before the guard. The guard fails closed; full uint64 support requires a separate Engine/type change.
- Envelope/store: 9 focused tests passed, including direct use of a stored record.
- All three code changes passed ordinary Builder type-check, changed-file lint, build/import and whitespace checks in isolated checkouts with built dependencies.
- Beacon APIs passed Redocly 1.19.0 lint, swagger-cli 4.0.4 bundling and example-preservation checks.

Test counts include repeated source suites. The new Lodestar heads currently expose only title checks, as does the fetched 9979 head; full hosted validation is not claimed for them. Beacon APIs 641's new head has successful CI build and spellcheck results. No fresh real BN/EL or complete Gloas lifecycle run was performed.

## Specification direction

Nico's 21 September review explicitly prefers extending `block`; the earlier neutral position and automatic switch-to-dedicated-event plan are no longer current. This is not cross-client consensus. The lightweight event remains an alternative, and an attestation-weight reveal signal remains separate research. Inclusion alone does not instruct a Builder to reveal. Kris already replied to that discussion on 16 September; do not repost the older draft reply.

The accepted source always supplies null custody columns. Safe/finalized execution hashes still need a supported EL contract. Geth's inspected zero-hash behavior does not by itself establish cross-client behavior or make concurrent shared-EL head updates safe. Keep 10109/80 draft while that question is resolved.

## Tracking

All 101 Linear issues were compared with their GitHub mirrors and Project status/assignee fields. Seven existing issues were missing from the project and have been added. Marko's existing LOD-95/96 assignments were mirrored to GitHub. LOD-59 is Canceled because the broader proposal was superseded; it is not Done. LOD-64 remains In Progress for its separate validation scope. No ownership was claimed from unassigned work.

Updated scopes cover SPEC-01/03, accepted source inputs, shared Engine numeric types, SSE recovery and lifecycle qualification. Historical dated evidence remains historical; issue descriptions are not proof of runtime completion.

## Upstream context and limits

- [SSE 10133](https://github.com/ChainSafe/lodestar/pull/10133) adds immediate headers and keepalive comments. It complements shared Builder subscriptions, but adds no replay or preference bootstrap.
- [Payload recovery 10134](https://github.com/ChainSafe/lodestar/pull/10134) adds deadline-driven polling and multiple roots per slot. Include late reveal, competing roots and next-slot fallback in runtime tests.
- [Consensus beta.1](https://github.com/ethereum/consensus-specs/releases/tag/v1.7.0-beta.1) and merged [PTC boundary 10141](https://github.com/ChainSafe/lodestar/pull/10141) require coherent client/vector pins. Source merges after stable v1.48.0 are not already released or deployed.
- Open 10128/10129/10142 remain qualification watches, not completed Builder work. Marko's archive deduplication 10089 and Beacon API 643 work already have separate tracking.

Local monitor reports were consulted and public deltas refreshed, but the monitor's complete historical/state workflow was not rerun. Its CURRENT file and successful-source cursors were not changed. No live authenticated Discord or current devnet telemetry was available. ENV-02 outreach remains paused.

## Next work

1. Approve the prepared review replies and continue maintainer review.
2. Reconcile fork 77 and the input experiment with merged source/store/policy contracts and the reviewed timer/gas fixes.
3. Settle finality-hash behavior, then complete concrete Engine/CLI construction and reviewed reveal lifecycle handling under LOD-76/77/78.
4. Run the pinned Gloas BN/EL loop with late reveal, competing roots, FULL/EMPTY and recovery cases.
5. Read fresh Discord discussion before proposing the next specification reply.
