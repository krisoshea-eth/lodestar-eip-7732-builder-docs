# ENV-02 Builder development environment

## Status

Working draft started on 2026-08-31. The fixture passes ethereum-package's Kurtosis dry-run and has completed three clean launches on the first development machine. The first-machine evidence covers a real BN event-to-block observation, controlled duplicate delivery, and connected and reconnecting shutdown. A second contributor must still reproduce the run before ENV-02 closes.

This environment exists to make API-02's remaining runtime evidence reproducible. It does not establish continuous devnet health and it does not replace the later full Builder-loop environment.

## Scope

The first run must prove all of the following with real processes:

1. A source BN emits a post-Gloas `block` SSE event.
2. The API-02 Builder requests that root through `getBlockV2` and logs one fork-correct observation.
3. Repeated delivery of the same root does not produce a second evaluation within the observer's retained-root window.
4. `SIGTERM` stops the Builder cleanly while the event stream is connected.
5. `SIGTERM` also stops the Builder cleanly while the event stream is reconnecting.

Selection, payload construction, reveal behavior, replay recovery, and multi-BN failover are outside this run.

## Reproducible pins

| Component | Pin | Purpose |
| --- | --- | --- |
| Lodestar upstream baseline | `57572140f8b75ab72466a869bf7bdc0ad0db265e` | `unstable` base used for the environment audit |
| Lodestar API-02 code under test | `1d2380582c8c01127c7160dca3abb5cc9dcb51b3` | Builds the BN, VC, and Builder binary used by the smoke run |
| Lodestar release comparison | `v1.47.0-rc.0` at `2aff495d9c3ecb1e7f15a431d3b0a4616f4bf103` | Release-candidate comparison only, not the code under test |
| Local Lodestar image | `sha256:ce201e8e5300a05677dd389a3140cd03d4c9eb8068a66d28f3c4369bbb1dcd26` | Image produced from the API-02 commit on the first development machine |
| ethereum-package | `4667e182e0459dee043a2f918d2845d6a66c96a1` | Kurtosis package definition |
| Kurtosis CLI and engine | `1.20.0`; Darwin arm64 archive SHA-256 `022c3609c6592eb4cc04001c06da49caaa5001e9f8abd0bb5d86332a5dd863ad` | Local orchestration tool |
| Geth | `ethpandaops/geth@sha256:50fad280c7e2a2d7df835b46753c7633882824fbf545efb63c03451f910090e8` | Multi-platform Glamsterdam devnet-8 image |
| eth2-val-tools | `protolambda/eth2-val-tools@sha256:46147228f291266148a6a21a2b9541367ad5f70e619d79cd5393459baf539f58` | Validator and Builder keystore derivation |
| Genesis generator | `ethpandaops/ethereum-genesis-generator@sha256:15bb557cbd6d29fc1b7516a7147326a8c8d3af54f3c3ac534ec8772f6e875256` | EL and CL genesis generation |
| Kurtosis HTTP helper | `badouralix/curl-jq@sha256:1e7c0284e24572ace7170df9fc91f15fd3b79ebf056d4dde17244d5d74bbfabc` | Package HTTP checks |
| Execution fixtures | `tests-glamsterdam-devnet@v8.1.2` | Fixture reference; publication alone is not runtime evidence |

If any pin changes, update this table and the fixture together. Do not silently substitute a branch, moving tag, or locally cached image.

## Prerequisites

- Node `24.13.0` and the repository-pinned pnpm 11.
- Docker with enough space to build the Lodestar source image.
- Kurtosis CLI and engine.
- A local checkout of Lodestar at the API-02 code-under-test commit.
- A local checkout of ethereum-package at the pinned commit.
- The Builder mnemonic loaded locally from the pinned ethereum-package `DEFAULT_BUILDER_MNEMONIC` constant. Do not copy it, the generated secret key, keystore, or password into this repository or the evidence log.

## Build the code under test

From the Lodestar checkout, verify the commit before building:

```bash
git rev-parse HEAD
docker build \
  --build-arg COMMIT=1d2380582c8c01127c7160dca3abb5cc9dcb51b3 \
  --tag local/lodestar:env-02-api02-1d238058 \
  .
```

Confirm that the tag resolves locally and record its immutable image ID in the evidence log:

```bash
docker image inspect local/lodestar:env-02-api02-1d238058 \
  --format '{{.Id}}'
```

## Launch the network

Use the stored [Kurtosis arguments](../test-plans/env-02-builder-dev.yaml) with the pinned ethereum-package checkout:

ethereum-package currently names two helper images with moving tags. Pull the recorded digests and assign the exact tag names expected by the pinned package before running with `--image-download missing`:

```bash
docker pull protolambda/eth2-val-tools@sha256:46147228f291266148a6a21a2b9541367ad5f70e619d79cd5393459baf539f58
docker tag \
  protolambda/eth2-val-tools@sha256:46147228f291266148a6a21a2b9541367ad5f70e619d79cd5393459baf539f58 \
  protolambda/eth2-val-tools:latest
docker pull ethpandaops/ethereum-genesis-generator@sha256:15bb557cbd6d29fc1b7516a7147326a8c8d3af54f3c3ac534ec8772f6e875256
docker tag \
  ethpandaops/ethereum-genesis-generator@sha256:15bb557cbd6d29fc1b7516a7147326a8c8d3af54f3c3ac534ec8772f6e875256 \
  ethpandaops/ethereum-genesis-generator:6.2.1
docker pull badouralix/curl-jq@sha256:1e7c0284e24572ace7170df9fc91f15fd3b79ebf056d4dde17244d5d74bbfabc
docker tag \
  badouralix/curl-jq@sha256:1e7c0284e24572ace7170df9fc91f15fd3b79ebf056d4dde17244d5d74bbfabc \
  badouralix/curl-jq:latest
```

```bash
kurtosis run \
  --enclave lodestar-builder-env-02 \
  /absolute/path/to/ethereum-package \
  --args-file /absolute/path/to/env-02-builder-dev.yaml \
  --verbosity detailed \
  --image-download missing
```

The fixture uses Gloas at genesis because ethereum-package only permits `builder_count` when `gloas_fork_epoch` is zero. Its dedicated Builder mnemonic is separate from the participant validator mnemonic. Both are public test-only inputs in the pinned package and may appear in Kurtosis output. Never reuse them outside this local environment, and do not publish derived keystores or passwords.

After launch, record the published BN REST endpoint and download the generated network configuration:

```bash
kurtosis enclave inspect lodestar-builder-env-02
kurtosis files download \
  lodestar-builder-env-02 \
  el_cl_genesis_data \
  /absolute/path/to/env-02-artifacts/genesis
```

Download this artifact after every clean launch. `MIN_GENESIS_TIME` changes with each fresh enclave, so reusing a config from an earlier launch correctly fails the Builder's config-equality gate.

## Derive the Builder keystore

Use the Builder mnemonic from the pinned ethereum-package constant. Because the stored arguments file does not override `builder_keys_mnemonic`, this is the mnemonic used for the genesis Builder. Load it into `BUILDER_MNEMONIC` locally without writing it into the runbook or evidence log. The exact output layout is generated by `eth2-val-tools`, so select the single derived EIP-2335 keystore and its password file from the output directory rather than relying on an unstated filename.

```bash
docker run --rm \
  --volume /absolute/path/to/env-02-artifacts/builder-keys:/out \
  protolambda/eth2-val-tools@sha256:46147228f291266148a6a21a2b9541367ad5f70e619d79cd5393459baf539f58 \
  keystores \
  --insecure \
  --prysm-pass builder-local-only \
  --out-loc /out \
  --source-mnemonic "$BUILDER_MNEMONIC" \
  --source-min 0 \
  --source-max 1
```

The keystore public key must match the Builder at index zero in the generated Gloas genesis state before starting the sidecar.

## Record the API path

Start the repository's local recording proxy in front of the published BN endpoint. It records method and path only, leaving request and response bodies out of the evidence log:

```bash
TARGET_URL=http://127.0.0.1:37000 \
LISTEN_PORT=19596 \
LOG_FILE=/absolute/path/to/env-02-artifacts/api-requests.jsonl \
node scripts/env-02/recording-proxy.mjs
```

For the duplicate-delivery case, add `DUPLICATE_FIRST_BLOCK_EVENT=true`. The proxy then duplicates exactly the first real `block` SSE frame and records a `duplicated-first-block-event` marker without recording the event body.

Use the proxy URL as the Builder's `--beaconNodeUrl`. The expected evidence is an event-stream request followed by a root-addressed block request for the observed root.

## Start the Builder

Run the sidecar from the same API-02 checkout used to build the container image. Use the generated genesis config so the Builder and BN use exactly the same fork schedule. Replace only the local artifact paths and fee recipient:

```bash
LODESTAR_PRESET=minimal /absolute/path/to/node-24.13.0 \
  packages/cli/bin/lodestar.js \
  builder \
  --paramsFile=/absolute/path/to/env-02-artifacts/genesis/config.yaml \
  --beaconNodeUrl=http://127.0.0.1:19596 \
  --keystore=/absolute/path/to/env-02-artifacts/builder-keys/keystore.json \
  --keystorePassword=/absolute/path/to/env-02-artifacts/builder-keys/password.txt \
  --executionFeeRecipient=0x0000000000000000000000000000000000000001 \
  --logLevel=debug
```

Confirm the actual generated config and keystore paths after downloading the artifacts. Do not change the image or code-under-test commit to make the command fit.

## Evidence procedure

Run the connected-stream and reconnecting-stream cases from a clean enclave. For each case record:

- the exact git commits and Docker image IDs;
- the complete Kurtosis command and arguments file;
- the BN, VC, and Builder logs from process start through shutdown;
- the proxy JSONL file showing the SSE request and root-addressed block request;
- the event root and the matching `Observed post-Gloas block` Builder log;
- the Builder exit code and elapsed shutdown time after `SIGTERM`;
- whether any process restarted automatically;
- any deviation from the pinned fixture.

For the reconnecting case, stop the recording proxy only after the Builder has established its first event stream. The proxy closes active connections on `SIGINT` and `SIGTERM`, which interrupts the SSE stream without stopping the source BN. Wait until the Builder reports the stream failure, send `SIGTERM`, and verify that it exits without waiting for a reconnect or request timeout.

Repeat the clean launch at least twice. A single successful run is point-in-time evidence, not proof of continuous health.

## Done criteria

ENV-02 can close when another contributor can follow this document from a clean checkout and reproduce both shutdown cases plus the event-to-block observation. LOD-12 can use that evidence only after the recorded event root, `getBlockV2` request, and Builder observation agree.
