import fs from "node:fs";
import path from "node:path";

// Always resolve against the Astro project root. `process.cwd()` is the project
// root during both `astro dev` and `astro build`.
const publicSchemasDir = path.resolve(process.cwd(), "public/schemas");

const semverLike = /^v\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/i;

// ─── Pillar taxonomy ────────────────────────────────────────────────────
//
// The canonical Pillar enum lives in `corpospec_types::common::Pillar` (Rust).
// Every published schema (v0.13.1+) carries its pillar id directly via the
// `x-corpospec-pillar` custom keyword stamped by `corpospec-validate`. This
// site reads that keyword via `pillarForSlug()`. The `LEGACY_SLUG_TO_PILLAR`
// table below is a fallback for older versions whose schemas pre-date the
// metadata stamp; new pillars / slugs MUST be added to the Rust source of
// truth, not here.

export type PillarId =
  | "root"
  | "entity"
  | "people"
  | "governance"
  | "financials"
  | "metrics"
  | "product"
  | "market"
  | "brand"
  | "integrations"
  | "legal";

export interface PillarMeta {
  id: PillarId;
  label: string;
  blurb: string;
  color: string; // CSS var
}

export const PILLARS: PillarMeta[] = [
  { id: "root",         label: "Root",         blurb: "Repository-level metadata",                       color: "var(--pillar-root)" },
  { id: "entity",       label: "Entity",       blurb: "Legal entity, jurisdiction, equity",              color: "var(--pillar-entity)" },
  { id: "people",       label: "People",       blurb: "Team, roles, organisational structure",           color: "var(--pillar-people)" },
  { id: "governance",   label: "Governance",   blurb: "Decisions, resolutions, OKRs, risk, board",       color: "var(--pillar-governance)" },
  { id: "financials",   label: "Financials",   blurb: "Model, actuals, forecasts, banking",              color: "var(--pillar-financials)" },
  { id: "metrics",      label: "Metrics",      blurb: "Metric definitions, snapshots, cohorts",          color: "var(--pillar-metrics)" },
  { id: "product",      label: "Product",      blurb: "Product, features, lifecycle, ASO, localization", color: "var(--pillar-product)" },
  { id: "market",       label: "Market",       blurb: "Sizing, GTM, ICP, competitors, monetization",     color: "var(--pillar-market)" },
  { id: "brand",        label: "Brand",        blurb: "Foundation, voice, logo, colors, typography, assets", color: "var(--pillar-brand)" },
  { id: "integrations", label: "Integrations", blurb: "External data sources and contracts",             color: "var(--pillar-integrations)" },
  { id: "legal",        label: "Legal",        blurb: "Contracts, policies, regulatory controls, privacy", color: "var(--pillar-legal)" },
];

/**
 * Fallback slug → pillar map used when a schema file has no
 * `x-corpospec-pillar` metadata (every release before v0.13.1).
 *
 * This map MUST cover every slug that has ever been published in any released
 * schema set. It is append-only — entries cannot be removed even if a schema
 * is later renamed, because older versions remain immutable on disk.
 *
 * For releases v0.13.1 onward the Rust generator stamps the pillar directly on
 * each schema, so this map is not consulted.
 */
const LEGACY_SLUG_TO_PILLAR: Record<string, PillarId> = {
  // root
  "manifest":                 "root",
  // entity
  "entity":                   "entity",
  "stakeholder":              "entity",
  "stock-class":              "entity",
  "jurisdiction-de":          "entity",
  // people
  "person":                   "people",
  "role":                     "people",
  "org-structure":            "people",
  // governance
  "bdr":                      "governance",
  "resolution":               "governance",
  "okr":                      "governance",
  "board":                    "governance",
  "risk-register":            "governance",
  // financials (canonical plural — matches Rust Pillar enum and on-disk dir)
  "financial-model":          "financials",
  "bank-account":             "financials",
  // metrics
  "metric":                   "metrics",
  "cohort":                   "metrics",
  // product
  "product":                  "product",
  "product-feature":          "product",
  "feature-matrix":           "product",
  "product-feature-flags":    "product",
  "product-lifecycle":        "product",
  "product-aso":              "product",
  "product-localization":     "product",
  "product-platform-config":  "product",
  // market
  "market-sizing":            "market",
  "gtm-strategy":             "market",
  "campaign":                 "market",
  "competitor":               "market",
  "icp":                      "market",
  "services-pricing":         "market",
  "monetization":             "market",
  // brand
  "brand-foundation":         "brand",
  "brand-logo":               "brand",
  "brand-colors":             "brand",
  "brand-typography":         "brand",
  "brand-voice":              "brand",
  "brand-architecture":       "brand",
  "brand-asset-catalog":      "brand",
  "brand-iconography":        "brand",
  "brand-photography":        "brand",
  // integrations
  "integration":              "integrations",
  // legal
  "contract":                 "legal",
  "policy":                   "legal",
  "legal-action-item":        "legal",
  "control":                  "legal",
  "privacy-classification":   "legal",
};

const VALID_PILLAR_IDS: ReadonlySet<PillarId> = new Set(
  PILLARS.map((p) => p.id),
);

/**
 * Resolve the pillar for a slug at a given published version.
 *
 * Reads the schema file's `x-corpospec-pillar` keyword when present (every
 * release stamped by the v0.13.1+ Rust generator). Falls back to the legacy
 * hand-curated map for older versions. Throws when neither source provides a
 * pillar — silently classifying as "root" hides bugs (this exact failure mode
 * caused 9 schemas to render under "Root" on the v0.13.1 index until this
 * function was hardened).
 */
export function pillarForSlug(version: string, slug: string): PillarId {
  const stamped = readSchemaPillar(version, slug);
  if (stamped) return stamped;
  const legacy = LEGACY_SLUG_TO_PILLAR[slug];
  if (legacy) return legacy;
  throw new Error(
    `pillarForSlug: slug '${slug}' (version ${version}) has no pillar mapping. ` +
      `Either the schema is missing 'x-corpospec-pillar' metadata, or the slug ` +
      `is new and needs an entry in LEGACY_SLUG_TO_PILLAR for legacy versions.`,
  );
}

function readSchemaPillar(version: string, slug: string): PillarId | null {
  const schema = readSchema(version, slug);
  const value = schema?.["x-corpospec-pillar"];
  if (typeof value !== "string") return null;
  if (!VALID_PILLAR_IDS.has(value as PillarId)) {
    throw new Error(
      `Schema ${version}/${slug} declares pillar '${value}' which is not in the ` +
        `canonical PILLARS list. Update PILLARS or fix the Rust generator.`,
    );
  }
  return value as PillarId;
}

export function pillarMeta(id: PillarId): PillarMeta {
  const meta = PILLARS.find((p) => p.id === id);
  if (!meta) throw new Error(`pillarMeta: unknown pillar id '${id}'`);
  return meta;
}

// ─── Version + slug listing ─────────────────────────────────────────────

export function listVersions(): string[] {
  if (!fs.existsSync(publicSchemasDir)) return [];
  return fs
    .readdirSync(publicSchemasDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && semverLike.test(e.name))
    .map((e) => e.name)
    .sort(compareVersionsDesc);
}

export function listSlugs(version: string): string[] {
  const dir = path.join(publicSchemasDir, version);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".schema.json"))
    .map((f) => f.replace(/\.schema\.json$/, ""))
    .sort();
}

export function hasContext(version: string): boolean {
  return fs.existsSync(path.join(publicSchemasDir, version, "context.jsonld"));
}

export function listSlugsByPillar(version: string): Array<{ pillar: PillarMeta; slugs: string[] }> {
  const all = listSlugs(version);
  const groups = new Map<PillarId, string[]>();
  for (const slug of all) {
    const p = pillarForSlug(version, slug);
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p)!.push(slug);
  }
  return PILLARS
    .filter((p) => groups.has(p.id))
    .map((p) => ({ pillar: p, slugs: groups.get(p.id)!.sort() }));
}

// ─── Schema introspection ───────────────────────────────────────────────

export interface SchemaFile {
  $id?: string;
  $schema?: string;
  $defs?: Record<string, JsonSchema>;
  title?: string;
  description?: string;
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  "x-corpospec-pillar"?: string;
  [k: string]: unknown;
}

export interface JsonSchema {
  $ref?: string;
  type?: string | string[];
  description?: string;
  format?: string;
  pattern?: string;
  enum?: unknown[];
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  [k: string]: unknown;
}

export function readSchema(version: string, slug: string): SchemaFile | null {
  const file = path.join(publicSchemasDir, version, `${slug}.schema.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as SchemaFile;
  } catch (err) {
    // Surface a readable build-time error rather than silently returning
    // empty — a malformed schema must fail loudly so it can be fixed.
    throw new Error(
      `readSchema: failed to parse ${version}/${slug}: ${(err as Error).message}`,
    );
  }
}

export function readSchemaMeta(
  version: string,
  slug: string,
): { title?: string; description?: string } {
  const s = readSchema(version, slug);
  return {
    title: s?.title,
    description: s?.description,
  };
}

export interface FieldRow {
  name: string;
  required: boolean;
  type: string;
  description?: string;
}

/**
 * Produce a flat, human-readable list of top-level fields for a schema.
 * Resolves $ref inside the same file to the referenced type's name, and
 * flattens `anyOf: [{X}, {type:"null"}]` to `X?`.
 */
export function readSchemaFields(version: string, slug: string): FieldRow[] {
  const schema = readSchema(version, slug);
  if (!schema?.properties) return [];
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties)
    .map(([name, prop]) => ({
      name,
      required: required.has(name),
      type: describeType(prop),
      description: prop.description ?? describeDescriptionFromRef(schema, prop),
    }))
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
}

export function readSchemaDefs(version: string, slug: string): Array<{
  name: string;
  description?: string;
  pattern?: string;
  enum?: unknown[];
  type?: string;
}> {
  const schema = readSchema(version, slug);
  if (!schema?.$defs) return [];
  return Object.entries(schema.$defs).map(([name, def]) => ({
    name,
    description: def.description,
    pattern: def.pattern,
    enum: def.enum,
    type: typeof def.type === "string" ? def.type : Array.isArray(def.type) ? def.type.join(" | ") : undefined,
  }));
}

function describeType(prop: JsonSchema): string {
  if (prop.$ref) return refToName(prop.$ref);
  if (prop.anyOf) {
    const parts = prop.anyOf.map(describeType).filter((p) => p !== "null");
    const nullable = prop.anyOf.some((p) => p.type === "null");
    const base = parts.length === 1 ? parts[0] : parts.join(" | ");
    return nullable ? `${base}?` : base;
  }
  if (prop.oneOf) return prop.oneOf.map(describeType).join(" | ");
  if (prop.allOf) return prop.allOf.map(describeType).join(" & ");
  if (prop.enum) return prop.enum.map((e) => JSON.stringify(e)).join(" | ");
  if (Array.isArray(prop.type)) {
    const nn = prop.type.filter((t) => t !== "null");
    const hasNull = prop.type.includes("null");
    const base = nn.length === 1 ? nn[0] : `(${nn.join(" | ")})`;
    return hasNull ? `${base}?` : base;
  }
  if (prop.type === "array") {
    return `${describeType(prop.items ?? {})}[]`;
  }
  if (prop.type === "object" && prop.properties) return "object";
  if (prop.type) return String(prop.type);
  return "unknown";
}

function refToName(ref: string): string {
  const parts = ref.split("/");
  return parts[parts.length - 1];
}

function describeDescriptionFromRef(schema: SchemaFile, prop: JsonSchema): string | undefined {
  if (!prop.$ref) return undefined;
  const name = refToName(prop.$ref);
  const def = schema.$defs?.[name];
  return def?.description;
}

// ─── Graph: cross-entity relationships (PathRef heuristic + curated) ─────

export interface RelationEdge {
  from: string; // slug
  to: string;   // slug
  label?: string;
}

/**
 * Curated edges between entities. Drawn from common PathRef usage patterns
 * in the CorpoSpec data model. Edges are by no means exhaustive — the goal
 * is orientation, not completeness.
 */
export const CURATED_EDGES: RelationEdge[] = [
  // entity ↔ people
  { from: "entity", to: "person", label: "founders" },
  { from: "entity", to: "stakeholder", label: "equity" },
  { from: "entity", to: "jurisdiction-de", label: "jurisdiction" },
  { from: "entity", to: "bank-account", label: "banking" },
  { from: "entity", to: "entity", label: "subsidiaries" },
  // people
  { from: "org-structure", to: "person", label: "members" },
  { from: "org-structure", to: "role", label: "roles" },
  { from: "org-structure", to: "entity", label: "company" },
  { from: "person", to: "role", label: "role" },
  { from: "role", to: "role", label: "reports_to" },
  // equity
  { from: "stakeholder", to: "stock-class", label: "class" },
  { from: "stakeholder", to: "person", label: "holder" },
  // governance
  { from: "bdr", to: "person", label: "decision_makers" },
  { from: "bdr", to: "bdr", label: "supersedes" },
  { from: "resolution", to: "person", label: "signatories" },
  { from: "resolution", to: "bdr", label: "implements" },
  { from: "resolution", to: "entity", label: "entity" },
  { from: "resolution", to: "contract", label: "contracts" },
  { from: "okr", to: "person", label: "owner" },
  { from: "okr", to: "bdr", label: "decisions" },
  { from: "board", to: "person", label: "members" },
  { from: "board", to: "entity", label: "entity" },
  { from: "risk-register", to: "person", label: "owner" },
  { from: "risk-register", to: "control", label: "controls" },
  // financial
  { from: "financial-model", to: "metric", label: "metrics" },
  { from: "financial-model", to: "bank-account", label: "accounts" },
  { from: "financial-model", to: "entity", label: "entity" },
  { from: "metric", to: "financial-model", label: "driver" },
  { from: "metric", to: "metric", label: "related" },
  { from: "cohort", to: "metric", label: "metric" },
  // product
  { from: "product", to: "product-feature", label: "features" },
  { from: "feature-matrix", to: "product-feature", label: "features" },
  { from: "feature-matrix", to: "competitor", label: "competitors" },
  { from: "product-lifecycle", to: "product-feature-flags", label: "flips" },
  { from: "product-aso", to: "product", label: "product" },
  { from: "product-localization", to: "product", label: "product" },
  { from: "product-platform-config", to: "product", label: "product" },
  // market
  { from: "gtm-strategy", to: "icp", label: "targets" },
  { from: "gtm-strategy", to: "bdr", label: "decisions" },
  { from: "campaign", to: "icp", label: "targets" },
  { from: "campaign", to: "bdr", label: "decisions" },
  { from: "monetization", to: "product", label: "product" },
  { from: "monetization", to: "bdr", label: "decisions" },
  { from: "services-pricing", to: "product", label: "product" },
  { from: "services-pricing", to: "bdr", label: "decisions" },
  { from: "competitor", to: "product", label: "vs." },
  { from: "icp", to: "icp", label: "inherits_from" },
  // brand
  { from: "brand-architecture", to: "product", label: "products" },
  { from: "brand-architecture", to: "bdr", label: "decisions" },
  { from: "brand-foundation", to: "bdr", label: "decisions" },
  { from: "brand-logo", to: "brand-asset-catalog", label: "asset" },
  { from: "brand-typography", to: "brand-asset-catalog", label: "fonts" },
  { from: "brand-iconography", to: "brand-asset-catalog", label: "icons" },
  { from: "brand-photography", to: "brand-asset-catalog", label: "photos" },
  // legal
  { from: "contract", to: "person", label: "parties" },
  { from: "contract", to: "entity", label: "entity" },
  { from: "contract", to: "bdr", label: "decisions" },
  { from: "policy", to: "control", label: "controls" },
  { from: "policy", to: "bdr", label: "decisions" },
  { from: "legal-action-item", to: "person", label: "owner" },
  { from: "privacy-classification", to: "product", label: "product" },
  // integrations
  { from: "integration", to: "person", label: "owner" },
  { from: "integration", to: "metric", label: "outputs" },
  // root
  { from: "manifest", to: "entity", label: "company" },
];

export function edgesForVersion(version: string): RelationEdge[] {
  const slugs = new Set(listSlugs(version));
  return CURATED_EDGES.filter((e) => slugs.has(e.from) && slugs.has(e.to));
}

// ─── Version comparison ────────────────────────────────────────────────

function compareVersionsDesc(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pb[i] - pa[i];
  }
  return b.localeCompare(a);
}

function parse(v: string): [number, number, number] {
  const m = v.replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return [0, 0, 0];
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}
