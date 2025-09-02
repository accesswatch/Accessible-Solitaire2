# Dependabot ignores

This repository has an active Dependabot ignore configured in `.github/dependabot.yml`.

- Directory: `/solitaire-accessible`
- Ignored dependency: `webpack-dev-server`
- Ignored update types: `security` (security-only updates are skipped)
- Review-by: 2026-01-01

Rationale
---------
`react-scripts@5.0.1` requires `webpack-dev-server@^4.6.0`. The earliest fixed version for
`webpack-dev-server` is in the 5.x series and is not compatible with the pinned `react-scripts`.
Dependabot would error when trying to apply a security-only fix that requires upgrading to 5.x.

Action
------
- Keep this ignore until `react-scripts` (or other top-level dependency) is updated to allow a
  patched `webpack-dev-server` or until a patched 4.x is released.
- On or before the review date, create an issue to re-evaluate and, if possible, remove the ignore.

How to remove the ignore
------------------------
Edit `.github/dependabot.yml` and remove the `ignore` entry for `webpack-dev-server`, or change
`security-updates-only` to `false` if you want all updates.
