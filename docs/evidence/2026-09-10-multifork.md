# Multifork simulation validation, 10 September 2026

## Scope and result

[Lodestar #10054](https://github.com/ChainSafe/lodestar/pull/10054), exact head `4395622a35744509bc026d181f6b0be960da0bdf`, passed the complete local multifork simulation with exit 0. The run started at 13:27:08 UTC and completed at 13:33:20 UTC. Its base is `2c42b1a22d446300c44995310603343859a58301`.

The run exercised missing-parent publication and verified sync of target slot 33, root `0x4b777a938e5855de880aa653f0e327806053936e36f804142d46468b59fc3991`. Ten focused regression tests separately cover successful publication, unexpected errors and exact-root lookup failures. The simulation uses Electra from genesis with Fulu disabled; it does not validate the Gloas Builder bid/reveal lifecycle or independent ENV-02 reproduction.

## Environment

- Isolated checkout with frozen lockfile installation and Node 24.13.0.
- Geth `ethereum/client-go:v1.16.7`, digest `sha256:fc5cee2ac93202d72af2eacaffbd17a43f6d9316032dc5f3c67663f91d43aa5f`.
- Lighthouse `ethpandaops/lighthouse:unstable-d235f2c`, digest `sha256:8f77d9150963f96f973976ec1d0254c64bfd0b3007becd498e7249a5e98e9db8`.
- Selected dependency and CLI TypeScript builds completed. Corepack failed when launching the trailing metadata command; running `node lib/util/gitData/writeGitData.js` from the CLI package completed it without a source change.
- Ordinary CLI type-check, changed-file Biome and `git diff --check` passed. Tracked files remained clean.

## Commands

From the repository root, after building the CLI and its dependencies:

```sh
node node_modules/vitest/vitest.mjs run --project unit packages/cli/test/unit/util/unknownBlockSync.test.ts
node node_modules/typescript/bin/tsc -p packages/cli/tsconfig.json --noEmit
node node_modules/@biomejs/biome/bin/biome check packages/cli/test/utils/crucible/utils/syncing.ts packages/cli/test/unit/util/unknownBlockSync.test.ts
```

From `packages/cli`:

```sh
LODESTAR_PRESET=minimal DOTENV_CONFIG_PATH=../../.env.test node -r dotenv/config --import tsx test/sim/multiFork.test.ts
```

The simulation creates logs under `packages/cli/test-logs/multi-fork/`, including `simulation-multi-fork.log` and `unknown-block-sync-node-beacon-lodestar.log`. Logs were inspected locally; they are not bundled in this document. Normal shutdown removed the test containers and simulation network. Existing Kurtosis containers and networks were left untouched; downloaded images remain cached.

These are local validation results, not hosted CI or current devnet health evidence.
