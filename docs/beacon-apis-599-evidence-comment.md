# Draft evidence comment for beacon-APIs #599

> Draft for Kris to review and post after the API-02 Lodestar PR is available. Do not post automatically.

We implemented the interim Builder observation path in Lodestar using the standard `block` event followed by `getBlockV2` for the event's block root.

The flow is sufficient for correctness, but it exposes two API costs that may help resolve this issue:

1. The `block` event contains the beacon block root, slot, and `execution_optimistic`. It does not contain the fork version, selected Builder index, or execution block hash. An external Builder therefore performs one `getBlockV2` request for every newly observed imported post-Gloas block merely to learn whether its bid was selected.
2. Lodestar emits the event after state transition and fork-choice import. Its retrieval path can serve the block from fork choice, the seen-block input cache, or the database, and the cache is pruned only after the database write. We therefore do not expect a 404 window on Lodestar. The Beacon API does not specify that event delivery must follow retrievability, and another client may choose a different emission point. A BN-agnostic Builder still needs bounded retry for an event-before-block window.

The implementation retries 404, server, timeout, and transport failures; does not retry other 4xx responses, cancellation, or response-decoding failures; and deduplicates block roots before retrieval. This works without a Lodestar-specific endpoint or a required Beacon API change.

The implementation evidence therefore supports treating either an enriched `block` event carrying selection identity or a dedicated `bid_included` event as an efficiency and interoperability improvement. It would remove the per-block fetch and give external Builders a more explicit cross-client contract, while the existing `block` plus `getBlockV2` path remains a functional fallback.
