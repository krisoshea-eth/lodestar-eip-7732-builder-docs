# HackMD GitHub Sync Guide

This guide maps each HackMD note to a Markdown file in this repository and explains the click-path for keeping the two sides in sync.

HackMD GitHub Sync is not live automatic sync. You explicitly push from HackMD to GitHub, or pull from GitHub into HackMD.

Official HackMD documentation: <https://hackmd.io/@docs/sync-a-note-with-github>

## One-Time GitHub App Setup

1. Open <https://github.com/apps/hackmd-hub>.
2. Click **Configure** or **Install**.
3. Choose the GitHub account `krisoshea-eth`.
4. Choose **Only select repositories**.
5. Select `lodestar-eip-7732-builder-docs`.
6. Confirm the installation/authorization.

If the repo does not appear inside HackMD afterwards, return to the same GitHub App page, reconfigure the installation, and make sure this repo is selected.

## File Mapping

Use these exact file paths when linking notes from HackMD.

| HackMD note | GitHub branch | GitHub file |
| --- | --- | --- |
| Proposal note | `main` | `docs/proposal.md` |
| Implementation-plan landing page | `main` | `docs/hackmd-implementation-plan-index.md` |
| Living technical note | `main` | `docs/living-technical-note.md` |
| Kris Week 0 update | `main` | `docs/weekly-updates/kris/week-00.md` |
| Kris Week 1 update | `main` | `docs/weekly-updates/kris/week-01.md` |
| Kris Week 2 update | `main` | `docs/weekly-updates/kris/week-02.md` |
| Kris Week 3 update | `main` | `docs/weekly-updates/kris/week-03.md` |
| Kris Week 4 update | `main` | `docs/weekly-updates/kris/week-04.md` |
| Kris Week 5 update | `main` | `docs/weekly-updates/kris/week-05.md` |
| Kris Week 6 update | `main` | `docs/weekly-updates/kris/week-06.md` |
| Kris Week 7 update | `main` | `docs/weekly-updates/kris/week-07.md` |
| Kris Week 8 update | `main` | `docs/weekly-updates/kris/week-08.md` |
| Marko Week 0 update | `main` | `docs/weekly-updates/marko/week-00.md` |
| Marko Week 1 update | `main` | `docs/weekly-updates/marko/week-01.md` |
| Marko Week 2 update | `main` | `docs/weekly-updates/marko/week-02.md` |
| Marko Week 3 update | `main` | `docs/weekly-updates/marko/week-03.md` |
| Marko Week 4 update | `main` | `docs/weekly-updates/marko/week-04.md` |
| Marko Week 5 update | `main` | `docs/weekly-updates/marko/week-05.md` |
| Marko Week 6 update | `main` | `docs/weekly-updates/marko/week-06.md` |
| Marko Week 7 update | `main` | `docs/weekly-updates/marko/week-07.md` |

While a review PR is still open, use that PR branch if you want HackMD to pull the current PR content before it is merged:

- Repo/docs updates: the active PR branch for that change.
- Full implementation plan: keep `docs/implementation-plan.md` canonical in GitHub; use the landing-page exception below for HackMD.
- Marko's weekly updates: these are mirrored from Marko's public HackMD notes. Pushing changes back to those HackMD notes requires Marko to sync them from his own HackMD/GitHub setup.

The Kris weekly update files were moved from `docs/weekly-updates/week-NN.md` to `docs/weekly-updates/kris/week-NN.md`. If any Kris HackMD note was linked to the old root-level path, update the linked GitHub file before the next push or pull.

## Link One HackMD Note To GitHub

Repeat this for each note you want to sync.

1. Open the HackMD note.
2. Open **Versions and GitHub Sync**.
   - This is usually available from the note menu or the history/version panel.
3. Choose **Push to GitHub** if the HackMD note is currently the source of truth.
4. Choose the repository `krisoshea-eth/lodestar-eip-7732-builder-docs`.
5. Choose the target branch:
   - Use `main` for merged content.
   - Use the matching PR branch only while reviewing pre-merge content.
6. Enter the matching file path from the table above.
7. If HackMD asks about line-break rendering, choose the GitHub/CommonMark-compatible option.
8. Save a named version in HackMD, for example `Sync bootstrap`.
9. Push that named version to GitHub.

After linking, HackMD should show the connected repository, branch, and file in **Versions and GitHub Sync**.

## Push HackMD Changes To GitHub

Use this when you edit in HackMD and want GitHub reviewers to see the change.

1. Save a named version in HackMD.
2. Open **Versions and GitHub Sync**.
3. Click **Push to GitHub**.
4. Select the named version you want to push.
5. Push it to the linked branch/file.

HackMD uses the version name and description as the Git commit message.

## Pull GitHub Changes Back Into HackMD

Use this when someone edits the Markdown in GitHub or a PR is merged.

1. Open the HackMD note.
2. Open **Versions and GitHub Sync**.
3. Click **Pull from GitHub**.
4. Select the branch to pull from.
5. Review the chunks HackMD shows.
6. Apply all changes or selected chunks.

HackMD saves a version named like `before pull from <branch>` before applying pulled changes. It does not lock the note during the merge, so avoid simultaneous editing during a pull.

## Implementation Plan Character-Limit Exception

The full `docs/implementation-plan.md` is larger than the per-note character limit reported by HackMD. Do not pay for an upgrade or remove reviewed content merely to preserve a duplicate full-note mirror.

Use `docs/hackmd-implementation-plan-index.md` for the existing public implementation-plan HackMD URL. It is a short landing page linking to the canonical reviewed GitHub plan, PR history, Living Technical Note, Linear project, and GitHub Project mirror.

After the matching docs PR merges:

1. Optionally download the current HackMD Markdown or save a named version as rollback evidence. The old content is not a source to merge into GitHub.
2. Change the note's linked GitHub file to `docs/hackmd-implementation-plan-index.md` on `main`, or replace the note with that file's content manually.
3. Preview the landing page and click each link.
4. Keep all future full-plan edits in `docs/implementation-plan.md`; update the landing page only when its links or status summary change.

## Recover Any Other Note That Is Behind GitHub

Do not push an older HackMD copy over a newer GitHub file.

1. Optionally download the current HackMD Markdown and save a named HackMD version as rollback evidence.
2. Confirm that the reviewed GitHub file contains every intended heading and decision.
3. Pull the reviewed `main` file into HackMD, unless the implementation-plan character-limit exception above applies.
4. Review the full result in both source and preview mode before saving a new named version.
5. If the pull fails or joins unrelated lines, leave GitHub as the source of truth and record the exact error. Try importing the reviewed file into a fresh HackMD note before paying for an upgrade or splitting the document.
6. Only reconnect or replace the public HackMD link after the fresh note renders correctly.

## Recommended Review Workflow

Use GitHub for review and HackMD for writing.

1. Write in HackMD.
2. Save a named HackMD version.
3. Push to a GitHub branch, for example `review/week-06-update`.
4. Open a GitHub PR into `main`.
5. Let reviewers comment on the Markdown diff.
6. Apply accepted GitHub edits.
7. Merge the PR.
8. Pull `main` back into the matching HackMD note.

This keeps GitHub review comments attached to concrete diffs and keeps HackMD updated deliberately.

## Notes And Limits

- Each HackMD note links to one Markdown file.
- HackMD syncs Markdown files; avoid MDX-specific syntax unless you are comfortable with HackMD not rendering it.
- The full implementation plan is about 118,000 bytes/characters and triggers HackMD's reported 100,000-character note limit. Keep the reviewed full plan on GitHub and use the short HackMD landing page instead of upgrading or deleting content.
- Do not edit the same note in HackMD while pulling GitHub changes into it.
- If a sync looks wrong, stop and create a named HackMD version before trying again.
