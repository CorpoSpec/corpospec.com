# corpospec.com

The open standard for **Company as Code** — published at [corpospec.com](https://corpospec.com).

This repository hosts:

- **The specification** (`/spec/`) — principles, pillars, PathRef grammar.
- **The schemas** (`/schemas/v<version>/`) — versioned, immutable JSON Schemas. Each slug is served as raw JSON at `https://corpospec.com/schemas/v<version>/<slug>.schema.json`.
- **The guide** (`/guide/`) — hands-on quickstart for adopting CorpoSpec in any repository.
- **The example** (`/example/`) — a complete reference company (ACME) populated across every pillar.

The site is an Astro static build deployed to GitHub Pages.

## Repo layout

```
corpospec.com/
├── .github/workflows/
│   └── pages.yml            # Astro build + GitHub Pages deploy
├── content/
│   └── examples/acme/       # Reference company, rendered at /example/
├── public/
│   ├── CNAME                # corpospec.com
│   └── schemas/             # Versioned schema artefacts (served raw)
│       └── v0.7.1/
│           ├── *.schema.json
│           └── context.jsonld
├── src/
│   ├── layouts/BaseLayout.astro
│   ├── lib/                 # Schema introspection helpers
│   ├── pages/
│   │   ├── index.astro
│   │   ├── spec/
│   │   ├── guide/
│   │   ├── example/
│   │   └── schemas/
│   └── styles/global.css
├── astro.config.mjs
├── package.json
└── LICENSE
```

## Source of truth

JSON Schemas in `public/schemas/v*/` are **not hand-written**. They are generated from the Rust types in [`beevelop/UNSTARTER`](https://github.com/beevelop/UNSTARTER)'s `corpospec-types` crate, pushed here as part of the tagged release pipeline, and immutable once written.

- **Schema definitions:** `corpospec/crates/corpospec-types/` in UNSTARTER.
- **Generator CLI:** `corpospec/crates/corpospec-validate/` in UNSTARTER, subcommand `generate-schemas`.
- **Publish flow:** UNSTARTER's `.github/workflows/release-deploy.yml` regenerates schemas on every `v*.*.*` tag, attaches a tarball + checksums to the GitHub Release, and pushes a new `public/schemas/v{version}/` directory here via an SSH deploy key. The push refuses to proceed if the directory already exists.

## Local development

```bash
# Requires Node 22+ and pnpm 10+
pnpm install
pnpm dev           # http://localhost:4321
pnpm build         # writes ./dist
pnpm astro check   # typecheck
```

## Licence

[MIT](LICENCE). The specification, schemas, documentation, and site code are all open.

## Contributing

Spec evolution happens upstream in [`beevelop/UNSTARTER`](https://github.com/beevelop/UNSTARTER) (Rust types + generator + validator). Site-level changes — docs wording, layout, new pages — are welcome via PR here. See [CONTRIBUTING.md](CONTRIBUTING.md).

Do **not** hand-edit files under `public/schemas/v*/`. They are released artefacts. To propose a schema change, open a PR against the Rust types in UNSTARTER.
