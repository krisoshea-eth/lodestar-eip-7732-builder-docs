# Draft evidence comment for beacon-APIs #599

> Draft only. Kris may manually post this as a comment on ethereum/beacon-APIs #599 after the API-02 PR is opened
> against ChainSafe/lodestar and its implementation evidence is stable. Do not post automatically. This is not a
> beacon-APIs code PR.

We implemented the interim Builder observation path in Lodestar using the standard `block` event followed by `getBlockV2` for the event's block root.

The flow is sufficient for correctness, but it exposes three API costs that may help resolve this issue:

1. The `block` event contains the beacon block root, slot, and `execution_optimistic`. It does not contain the fork version, selected Builder index, or execution block hash. An external Builder therefore performs one `getBlockV2` request for every newly observed imported post-Gloas block merely to learn whether its bid was selected.
2. Lodestar emits the event after state transition and fork-choice import. Its retrieval path can serve the block from fork choice, the seen-block input cache, or the database, and the cache is pruned only after the database write. We therefore do not expect a 404 window on Lodestar. The Beacon API does not specify that event delivery must follow retrievability, and another client may choose a different emission point. A BN-agnostic Builder still needs bounded retry for an event-before-block window.
3. Lodestar event frames contain `event` and `data` but no SSE `id`. EventSource can reconnect, but standard `Last-Event-ID` resumption cannot identify or replay a selection notification missed during the disconnect. A Builder therefore needs a separate bounded reconciliation path, and longer gaps or competing roots require a stronger contract than transport reconnection alone.

The implementation retries 404, server, timeout, and transport failures; does not retry other 4xx responses, cancellation, or response-decoding failures; and deduplicates block roots before retrieval. This works without a Lodestar-specific endpoint or a required Beacon API change.

The implementation evidence therefore supports treating either an enriched `block` event carrying selection identity or a dedicated `bid_included` event as an efficiency and interoperability improvement. It would remove the per-block fetch and give external Builders a more explicit cross-client contract. A stable replay identifier or an explicitly specified reconciliation mechanism would also make reconnect behavior interoperable, while the existing `block` plus `getBlockV2` path remains a functional bounded fallback.
