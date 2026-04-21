# Contributing

## Scope of changes in this repo

**Welcome here:**
- Spec prose under `src/pages/spec/`
- Guide improvements under `src/pages/guide/`
- ACME example refinements under `content/examples/acme/`
- Site layout, typography, navigation, accessibility
- New meta pages (FAQ, comparisons, case studies)
- Bug reports and issues against the site

**Not here:**
- Schema field additions or removals
- JSON Schema fixes under `public/schemas/v*/` — those are immutable release artefacts
- New schemas or pillars

Schema changes happen upstream in [`beevelop/UNSTARTER`](https://github.com/beevelop/UNSTARTER) against the Rust types in `corpospec/crates/corpospec-types/`. Once a new version is tagged there, this site automatically ingests and publishes the schemas.

## Developing locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:4321`. Edits hot-reload.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new content, new pages
- `fix:` — corrections to docs or bugs
- `chore:` — tooling, dependencies, CI
- `docs:` — spec prose improvements
- `ingest:` — reserved for automated schema ingest commits (do not use manually)

## Opening a PR

1. Fork and branch from `main`.
2. Run `pnpm build` locally to catch regressions.
3. Keep changes narrowly scoped — one PR per concern.
4. Reference any relevant UNSTARTER BDR in the description.

## Reporting issues

If the site is out of date with the canonical schemas, or a YAML snippet in the guide fails validation, open an issue with:

- What you expected
- What you saw (copy the URL and, if applicable, the validation error)
- Which schema version you were targeting

Security-sensitive reports: email security@unstarter.com instead of opening a public issue.
