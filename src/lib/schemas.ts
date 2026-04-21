import fs from "node:fs";
import path from "node:path";

// Always resolve against the Astro project root. `process.cwd()` is the project
// root during both `astro dev` and `astro build`.
const publicSchemasDir = path.resolve(process.cwd(), "public/schemas");

const semverLike = /^v\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/i;

// ─── Pillar taxonomy ────────────────────────────────────────────────────

export type PillarId =
  | "root"
  | "entity"
  | "people"
  | "governance"
  | "financial"
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
  { id: "financial",    label: "Financial",    blurb: "Model, actuals, forecasts, banking",              color: "var(--pillar-financial)" },
  { id: "metrics",      label: "Metrics",      blurb: "Metric definitions and snapshots",                color: "var(--pillar-metrics)" },
  { id: "product",      label: "Product",      blurb: "Product, features, roadmap",                      color: "var(--pillar-product)" },
  { id: "market",       label: "Market",       blurb: "Sizing, GTM, ICP, competitors, monetization",     color: "var(--pillar-market)" },
  { id: "brand",        label: "Brand",        blurb: "Foundation, voice, logo, colors, typography",     color: "var(--pillar-brand)" },
  { id: "integrations", label: "Integrations", blurb: "External data sources and contracts",             color: "var(--pillar-integrations)" },
  { id: "legal",        label: "Legal",        blurb: "Contracts, policies, regulatory controls",        color: "var(--pillar-legal)" },
];

const SLUG_TO_PILLAR: Record<string, PillarId> = {
  // root
  "manifest":             "root",
  // entity
  "entity":               "entity",
  "stakeholder":          "entity",
  "stock-class":          "entity",
  "jurisdiction-de":      "entity",
  // people
  "person":               "people",
  "role":                 "people",
  "org-structure":        "people",
  // governance
  "bdr":                  "governance",
  "resolution":           "governance",
  "okr":                  "governance",
  "board":                "governance",
  "risk-register":        "governance",
  // financial
  "financial-model":      "financial",
  "bank-account":         "financial",
  // metrics
  "metric":               "metrics",
  // product
  "product":              "product",
  "product-feature":      "product",
  "feature-matrix":       "product",
  // market
  "market-sizing":        "market",
  "gtm-strategy":         "market",
  "campaign":             "market",
  "competitor":           "market",
  "icp":                  "market",
  "services-pricing":     "market",
  "monetization":         "market",
  // brand
  "brand-foundation":     "brand",
  "brand-logo":           "brand",
  "brand-colors":         "brand",
  "brand-typography":     "brand",
  "brand-voice":          "brand",
  "brand-architecture":   "brand",
  // integrations
  "integration":          "integrations",
  // legal
  "contract":             "legal",
  "policy":               "legal",
  "legal-action-item":    "legal",
  "control":              "legal",
};

export function pillarForSlug(slug: string): PillarId {
  return SLUG_TO_PILLAR[slug] ?? "root";
}

export function pillarMeta(id: PillarId): PillarMeta {
  return PILLARS.find((p) => p.id === id) ?? PILLARS[0];
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
    const p = pillarForSlug(slug);
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
  } catch {
    return null;
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
  return "any";
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
  // people
  { from: "org-structure", to: "person", label: "members" },
  { from: "org-structure", to: "role", label: "roles" },
  { from: "person", to: "role", label: "role" },
  // equity
  { from: "stakeholder", to: "stock-class", label: "class" },
  { from: "stakeholder", to: "person", label: "holder" },
  // governance
  { from: "bdr", to: "person", label: "decision_makers" },
  { from: "resolution", to: "person", label: "signatories" },
  { from: "resolution", to: "bdr", label: "implements" },
  { from: "okr", to: "person", label: "owner" },
  { from: "board", to: "person", label: "members" },
  { from: "risk-register", to: "person", label: "owner" },
  { from: "risk-register", to: "control", label: "controls" },
  // financial
  { from: "financial-model", to: "metric", label: "metrics" },
  { from: "financial-model", to: "bank-account", label: "accounts" },
  { from: "metric", to: "financial-model", label: "driver" },
  // product
  { from: "product", to: "product-feature", label: "features" },
  { from: "feature-matrix", to: "product-feature", label: "features" },
  { from: "feature-matrix", to: "competitor", label: "competitors" },
  // market
  { from: "gtm-strategy", to: "icp", label: "targets" },
  { from: "campaign", to: "icp", label: "targets" },
  { from: "monetization", to: "product", label: "product" },
  { from: "services-pricing", to: "product", label: "product" },
  { from: "competitor", to: "product", label: "vs." },
  // brand
  { from: "brand-architecture", to: "product", label: "products" },
  // legal
  { from: "contract", to: "person", label: "parties" },
  { from: "contract", to: "entity", label: "entity" },
  { from: "policy", to: "control", label: "controls" },
  { from: "legal-action-item", to: "person", label: "owner" },
  // integrations
  { from: "integration", to: "contract", label: "contract" },
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
