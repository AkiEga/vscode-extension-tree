---
name: dependabot-security-autofix
description: Auto-fix security vulnerabilities from Dependabot alerts for this repository and open a validated PR. Use this when asked to fix security vulnerabilities or Dependabot security alerts.
license: MIT
---

# Dependabot security auto-fix skill

Use this skill when the request is about fixing security vulnerabilities reported by Dependabot.

## Repository expectations
- Keep changes minimal and scoped to vulnerability remediation.
- Prefer lockfile-safe remediation first (`npm audit fix --package-lock-only`).
- Validate build and tests before proposing PR output.
- Use the existing PR convention:
  - Branch: `automation/dependabot-security-fix`
  - Title: `chore: apply npm security fixes`
  - Labels: `dependencies`, `security`
  - Include a **Test results** section with `npm run package` and `npm test`.

## Procedure
1. **List open Dependabot alerts**
   - Use: `gh api "/repos/<owner>/<repo>/dependabot/alerts?state=open&per_page=100"`
   - If there are no open alerts, report that no fix PR is needed.

2. **Apply automated dependency remediation**
   - Run:
     - `npm ci`
     - `npm audit fix --package-lock-only`
   - If direct package updates are required, apply the smallest safe version bump that resolves the advisory.

3. **Validate**
   - Run:
     - `npm run package`
     - `npm test`
   - If validation fails, do not hide failure. Report failing commands and key errors.

4. **Prepare PR**
   - Commit only related files (typically `package-lock.json` and optionally `package.json`).
   - Use the repository PR format above.
   - In the PR body include:
     - Summary of security changes
     - **Test results** with explicit pass/fail per command
     - Workflow/run link when available

## Output contract
- If fixed: provide changed packages, advisories addressed, and validation results.
- If partially fixed: list unresolved advisories and why they remain (no patch available, breaking major upgrade, etc.).
