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
| Proposal note | `main` after the repo-docs PR is merged | `docs/proposal.md` |
| Implementation plan | `main` after the implementation-plan PR is merged | `docs/implementation-plan.md` |
| Living technical note | `main` after the living-note PR is merged | `docs/living-technical-note.md` |
| Week 0 update | `main` after the repo-docs PR is merged | `docs/weekly-updates/week-00.md` |
| Week 1 update | `main` after the repo-docs PR is merged | `docs/weekly-updates/week-01.md` |
| Week 2 update | `main` after the repo-docs PR is merged | `docs/weekly-updates/week-02.md` |
| Week 3 update | `main` after the repo-docs PR is merged | `docs/weekly-updates/week-03.md` |
| Week 4 update | `main` after the repo-docs PR is merged | `docs/weekly-updates/week-04.md` |
| Week 5 update | `main` after the repo-docs PR is merged | `docs/weekly-updates/week-05.md` |

While a review PR is still open, use that PR branch if you want HackMD to pull the current PR content before it is merged:

- Repo docs and weekly updates: `review/repo-docs`
- Implementation plan: `review/implementation-plan`
- Living technical note: `review/living-technical-note`

## Link One HackMD Note To GitHub

Repeat this for each note you want to sync.

1. Open the HackMD note.
2. Open **Versions and GitHub Sync**.
   - This is usually available from the note menu or the history/version panel.
3. Choose **Push to GitHub** if the HackMD note is currently the source of truth.
4. Choose the repository `krisoshea-eth/lodestar-eip-7732-builder-docs`.
5. Choose the target branch:
   - Use `main` after the matching review PR is merged.
   - Use the matching `review/...` branch only while reviewing pre-merge content.
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
- HackMD's free plan may limit the number of GitHub sync operations per month.
- Do not edit the same note in HackMD while pulling GitHub changes into it.
- If a sync looks wrong, stop and create a named HackMD version before trying again.
