export const exceptionExpiresOn = "2026-12-18";
export const expectedDependencyWhy = `minimatch@10.2.6
  └─ @ts-morph/common@0.27.0 (requires ^10.0.1)
     └─ ts-morph@26.0.0 (requires ~0.27.0)
        └─ shadcn@4.23.0 (requires ^26.0.0)
           └─ @breakpoint/web@workspace (requires ^4.23.0)`;

const advisoryUrl = "https://github.com/advisories/GHSA-g3hv-75wg-m249";
const reviewedShadcnVersion = "4.23.0";

const compatibleReleasePolicies = [
  {
    packageName: "ts-morph",
    reviewedVersion: "26.0.0",
    minimum: [26n, 0n, 0n],
    maximum: [27n, 0n, 0n],
  },
  {
    packageName: "@ts-morph/common",
    reviewedVersion: "0.27.0",
    minimum: [0n, 27n, 0n],
    maximum: [0n, 28n, 0n],
  },
] as const;

type RegistryResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};

type RegistryFetch = (url: string) => Promise<RegistryResponse>;

type PolicyInput = {
  auditOutput: string;
  dependencyWhy: string;
  today: string;
  registryMetadata: Record<string, unknown>;
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function record(value: unknown, label: string): Record<string, unknown> {
  invariant(
    typeof value === "object" && value !== null && !Array.isArray(value),
    `${label} must be an object`,
  );
  return value as Record<string, unknown>;
}

type VersionParts = readonly [bigint, bigint, bigint];

const semanticVersion =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function compareVersions(left: VersionParts, right: VersionParts): number {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }
  return 0;
}

function stableVersion(version: string, label: string): VersionParts | null {
  const match = semanticVersion.exec(version);
  invariant(
    match,
    `${label} must be valid SemVer, received ${JSON.stringify(version)}`,
  );
  if (match[4] !== undefined) return null;
  return [BigInt(match[1]), BigInt(match[2]), BigInt(match[3])];
}

type ValidatedRegistryMetadata = {
  latest: string;
  versions: Map<
    string,
    { release: Record<string, unknown>; stableParts: VersionParts | null }
  >;
};

// npm's full-metadata response can prove consistency only for records it returns;
// it cannot prove that the registry supplied an exhaustive historical archive.
function validateRegistryMetadata(
  packageName: string,
  reviewedVersion: string,
  metadata: unknown,
): ValidatedRegistryMetadata {
  const packageMetadata = record(metadata, `${packageName} registry metadata`);
  invariant(
    packageMetadata.name === packageName,
    `${packageName} registry package name changed`,
  );

  const rawVersions = record(
    packageMetadata.versions,
    `${packageName} registry versions`,
  );
  invariant(
    Object.keys(rawVersions).length > 0,
    `${packageName} registry versions must not be empty`,
  );

  const distTags = record(
    packageMetadata["dist-tags"],
    `${packageName} registry dist-tags`,
  );
  const latest = distTags.latest;
  invariant(
    typeof latest === "string",
    `${packageName} registry dist-tags.latest must be a string`,
  );
  const latestParts = stableVersion(
    latest,
    `${packageName} registry dist-tags.latest`,
  );
  invariant(
    latestParts !== null,
    `${packageName} registry dist-tags.latest must be a stable SemVer version`,
  );

  const versions = new Map<
    string,
    { release: Record<string, unknown>; stableParts: VersionParts | null }
  >();
  for (const [version, value] of Object.entries(rawVersions)) {
    const stableParts = stableVersion(
      version,
      `${packageName} registry version key ${JSON.stringify(version)}`,
    );
    const release = record(value, `${packageName} ${version} registry release`);
    invariant(
      release.version === version,
      `${packageName} registry release ${version} must declare matching version ${version}`,
    );
    versions.set(version, { release, stableParts });
  }

  invariant(
    versions.has(latest),
    `${packageName} registry dist-tags.latest ${latest} is missing from versions`,
  );
  invariant(
    versions.has(reviewedVersion),
    `${packageName} registry metadata is missing reviewed ${reviewedVersion}`,
  );

  return { latest, versions };
}

function validateAuditOutput(auditOutput: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(auditOutput);
  } catch {
    throw new Error("bun audit output is not valid JSON");
  }

  const report = record(parsed, "bun audit output");
  invariant(
    Object.keys(report).length === 1 && Array.isArray(report.minimatch),
    "audit output contains an unapproved package advisory",
  );
  invariant(
    report.minimatch.length === 1,
    "audit output must contain exactly one minimatch advisory",
  );

  const advisory = record(report.minimatch[0], "minimatch advisory");
  invariant(
    advisory.url === advisoryUrl,
    "the minimatch advisory ID changed or another advisory appeared",
  );
  invariant(
    advisory.severity === "moderate",
    "the minimatch advisory severity changed",
  );
  invariant(
    advisory.vulnerable_versions === ">=7.0.0 <11.0.1",
    "the minimatch affected range changed",
  );
}

function validateExpiry(today: string): void {
  invariant(
    /^\d{4}-\d{2}-\d{2}$/.test(today) &&
      new Date(`${today}T00:00:00Z`).toISOString().startsWith(today),
    `invalid policy date ${today}`,
  );
  invariant(
    today < exceptionExpiresOn,
    `the minimatch exception expired on ${exceptionExpiresOn}`,
  );
}

function validateShadcnMetadata(metadata: unknown): void {
  const { latest, versions } = validateRegistryMetadata(
    "shadcn",
    reviewedShadcnVersion,
    metadata,
  );
  let newestStableVersion = reviewedShadcnVersion;
  let newestStableParts = stableVersion(
    reviewedShadcnVersion,
    "reviewed shadcn version",
  );
  invariant(newestStableParts, `${reviewedShadcnVersion} must be stable`);

  for (const [version, { stableParts }] of versions) {
    if (
      stableParts !== null &&
      compareVersions(stableParts, newestStableParts) > 0
    ) {
      newestStableVersion = version;
      newestStableParts = stableParts;
    }
  }

  invariant(
    newestStableVersion === reviewedShadcnVersion,
    `shadcn changed to ${newestStableVersion} from reviewed ${reviewedShadcnVersion}; renewed security review is required`,
  );
  invariant(
    latest === reviewedShadcnVersion,
    `shadcn changed to ${latest} from reviewed ${reviewedShadcnVersion}; renewed security review is required`,
  );

  const release = versions.get(latest)?.release;
  invariant(release, `shadcn ${latest} registry release is missing`);
  invariant(
    record(release.dependencies, `shadcn ${latest} dependencies`)[
      "ts-morph"
    ] === "^26.0.0",
    "stable shadcn compatibility evidence changed",
  );
}

function validateCompatibleRelease(
  policy: (typeof compatibleReleasePolicies)[number],
  metadata: unknown,
): void {
  const { versions } = validateRegistryMetadata(
    policy.packageName,
    policy.reviewedVersion,
    metadata,
  );

  let latestVersion = policy.reviewedVersion;
  let latestParts = stableVersion(
    policy.reviewedVersion,
    `${policy.packageName} reviewed version`,
  );
  invariant(latestParts, `${policy.reviewedVersion} must be stable`);

  for (const [version, { stableParts: parts }] of versions) {
    if (
      parts === null ||
      compareVersions(parts, policy.minimum) < 0 ||
      compareVersions(parts, policy.maximum) >= 0
    ) {
      continue;
    }

    const comparison = compareVersions(parts, latestParts);
    if (
      version !== policy.reviewedVersion &&
      (latestVersion === policy.reviewedVersion ||
        comparison > 0 ||
        (comparison === 0 && version > latestVersion))
    ) {
      latestVersion = version;
      latestParts = parts;
    }
  }

  invariant(
    latestVersion === policy.reviewedVersion,
    `${policy.packageName} changed to ${latestVersion} from reviewed ${policy.reviewedVersion}; renewed security review is required`,
  );
}

export async function fetchRegistryMetadata(
  packageName: string,
  fetcher: RegistryFetch = fetch,
): Promise<unknown> {
  let response: RegistryResponse;
  try {
    response = await fetcher(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `npm registry request for ${packageName} failed: ${detail}`,
    );
  }

  invariant(
    response.ok,
    `npm registry request for ${packageName} failed with status ${response.status}`,
  );

  try {
    return await response.json();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `npm registry response for ${packageName} is not valid JSON: ${detail}`,
    );
  }
}

export function validateDependencyAuditPolicy(input: PolicyInput): void {
  validateExpiry(input.today);
  validateAuditOutput(input.auditOutput);
  invariant(
    input.dependencyWhy === expectedDependencyWhy,
    "the approved minimatch dependency path or relationship changed",
  );

  validateShadcnMetadata(input.registryMetadata.shadcn);
  for (const policy of compatibleReleasePolicies) {
    validateCompatibleRelease(
      policy,
      input.registryMetadata[policy.packageName],
    );
  }
}
