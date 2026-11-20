import { describe, expect, it } from "vitest";
import {
  expectedDependencyWhy,
  fetchRegistryMetadata,
  validateDependencyAuditPolicy,
} from "../dependency-audit-policy";

const approvedAudit = {
  minimatch: [
    {
      url: "https://github.com/advisories/GHSA-g3hv-75wg-m249",
      severity: "moderate",
      vulnerable_versions: ">=7.0.0 <11.0.1",
    },
  ],
};

function registryMetadata(
  packageName: "ts-morph" | "@ts-morph/common",
  versions: string[],
  latest = versions[versions.length - 1],
): Record<string, unknown> {
  return {
    name: packageName,
    "dist-tags": { latest },
    versions: Object.fromEntries(
      versions.map((version) => [version, { version }]),
    ),
  };
}

function approvedInput() {
  return {
    auditOutput: JSON.stringify(approvedAudit),
    dependencyWhy: expectedDependencyWhy,
    today: "2026-11-19",
    registryMetadata: {
      shadcn: {
        name: "shadcn",
        "dist-tags": { latest: "4.23.0" },
        versions: {
          "4.23.0": {
            version: "4.23.0",
            dependencies: { "ts-morph": "^26.0.0" },
          },
        },
      },
      "ts-morph": registryMetadata("ts-morph", [
        "26.0.0",
        "27.0.0-beta.1",
        "27.0.0",
      ]),
      "@ts-morph/common": registryMetadata("@ts-morph/common", [
        "0.27.0",
        "0.28.0-beta.1",
        "0.28.0",
      ]),
    },
  };
}

describe("dependency audit policy", () => {
  it("accepts the exact approved advisory, graph, date, and compatible releases", () => {
    expect(() => validateDependencyAuditPolicy(approvedInput())).not.toThrow();
  });

  it("rejects an additional advisory", () => {
    const input = approvedInput();
    input.auditOutput = JSON.stringify({
      ...approvedAudit,
      another: [{ url: "https://github.com/advisories/GHSA-unapproved" }],
    });

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "unapproved package advisory",
    );
  });

  it.each([
    [
      "url",
      "https://github.com/advisories/GHSA-changed",
      "the minimatch advisory ID changed or another advisory appeared",
    ],
    ["severity", "high", "the minimatch advisory severity changed"],
    [
      "vulnerable_versions",
      ">=7.0.0 <11.0.2",
      "the minimatch affected range changed",
    ],
  ] as const)(
    "rejects changed minimatch advisory %s",
    (field, value, message) => {
      const input = approvedInput();
      input.auditOutput = JSON.stringify({
        minimatch: [{ ...approvedAudit.minimatch[0], [field]: value }],
      });

      expect(() => validateDependencyAuditPolicy(input)).toThrow(message);
    },
  );

  it("rejects duplicate minimatch advisories", () => {
    const input = approvedInput();
    input.auditOutput = JSON.stringify({
      minimatch: [approvedAudit.minimatch[0], approvedAudit.minimatch[0]],
    });

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "audit output must contain exactly one minimatch advisory",
    );
  });

  it("rejects malformed audit JSON", () => {
    const input = approvedInput();
    input.auditOutput = "not-json";

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "bun audit output is not valid JSON",
    );
  });

  it("rejects dependency path changes", () => {
    const input = approvedInput();
    input.dependencyWhy = expectedDependencyWhy.replace("10.2.6", "10.2.7");

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "dependency path or relationship changed",
    );
  });

  it("rejects the expiry day itself", () => {
    const input = approvedInput();
    input.today = "2026-12-18";

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "expired on 2026-12-18",
    );
  });

  it("rejects a new stable ts-morph 26.x release", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = registryMetadata("ts-morph", [
      "26.0.0",
      "26.0.1",
    ]);

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph changed to 26.0.1 from reviewed 26.0.0; renewed security review is required",
    );
  });

  it("rejects a changed stable shadcn release", () => {
    const input = approvedInput();
    input.registryMetadata.shadcn = {
      name: "shadcn",
      "dist-tags": { latest: "4.23.1" },
      versions: {
        "4.23.0": {
          version: "4.23.0",
          dependencies: { "ts-morph": "^26.0.0" },
        },
        "4.23.1": {
          version: "4.23.1",
          dependencies: { "ts-morph": "^26.0.0" },
        },
      },
    };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "shadcn changed to 4.23.1 from reviewed 4.23.0; renewed security review is required",
    );
  });

  it("rejects a changed shadcn ts-morph dependency range", () => {
    const input = approvedInput();
    input.registryMetadata.shadcn.versions["4.23.0"].dependencies["ts-morph"] =
      "^27.0.0";

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "stable shadcn compatibility evidence changed",
    );
  });

  it("rejects a newer stable shadcn release when latest remains reviewed", () => {
    const input = approvedInput();
    input.registryMetadata.shadcn = {
      name: "shadcn",
      "dist-tags": { latest: "4.23.0" },
      versions: {
        "4.23.0": {
          version: "4.23.0",
          dependencies: { "ts-morph": "^26.0.0" },
        },
        "4.24.0": {
          version: "4.24.0",
          dependencies: { "ts-morph": "^26.0.0" },
        },
      },
    };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "shadcn changed to 4.24.0 from reviewed 4.23.0; renewed security review is required",
    );
  });

  it("ignores a newer shadcn prerelease when latest remains reviewed", () => {
    const input = approvedInput();
    input.registryMetadata.shadcn = {
      name: "shadcn",
      "dist-tags": { latest: "4.23.0" },
      versions: {
        "4.23.0": {
          version: "4.23.0",
          dependencies: { "ts-morph": "^26.0.0" },
        },
        "4.24.0-beta.1": {
          version: "4.24.0-beta.1",
          dependencies: { "ts-morph": "^26.0.0" },
        },
      },
    };

    expect(() => validateDependencyAuditPolicy(input)).not.toThrow();
  });

  it("rejects a new stable @ts-morph/common 0.27.x release", () => {
    const input = approvedInput();
    input.registryMetadata["@ts-morph/common"] = registryMetadata(
      "@ts-morph/common",
      ["0.27.0", "0.27.1"],
    );

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "@ts-morph/common changed to 0.27.1 from reviewed 0.27.0; renewed security review is required",
    );
  });

  it("rejects missing registry metadata", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = { name: "ts-morph" };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph registry versions must be an object",
    );
  });

  it("rejects registry metadata that is not an object", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = [];

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph registry metadata must be an object",
    );
  });

  it("rejects an empty versions object", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = {
      name: "ts-morph",
      "dist-tags": { latest: "26.0.0" },
      versions: {},
    };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph registry versions must not be empty",
    );
  });

  it("rejects missing dist-tags", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = {
      name: "ts-morph",
      versions: { "26.0.0": { version: "26.0.0" } },
    };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph registry dist-tags must be an object",
    );
  });

  it.each([
    [undefined, "ts-morph registry dist-tags.latest must be a string"],
    [
      "26.01.0",
      'ts-morph registry dist-tags.latest must be valid SemVer, received "26.01.0"',
    ],
    [
      "26.1.0-beta.1",
      "ts-morph registry dist-tags.latest must be a stable SemVer version",
    ],
  ])(
    "rejects missing, malformed, or unstable latest tag %s",
    (latest, message) => {
      const input = approvedInput();
      input.registryMetadata["ts-morph"] = {
        name: "ts-morph",
        "dist-tags": { latest },
        versions: { "26.0.0": { version: "26.0.0" } },
      };

      expect(() => validateDependencyAuditPolicy(input)).toThrow(message);
    },
  );

  it("rejects a latest tag that points to a missing release", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = {
      name: "ts-morph",
      "dist-tags": { latest: "26.0.1" },
      versions: { "26.0.0": { version: "26.0.0" } },
    };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph registry dist-tags.latest 26.0.1 is missing from versions",
    );
  });

  it("rejects metadata that omits the reviewed baseline release", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = registryMetadata("ts-morph", [
      "27.0.0",
    ]);

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph registry metadata is missing reviewed 26.0.0",
    );
  });

  it("rejects a release without its version field", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = {
      name: "ts-morph",
      "dist-tags": { latest: "26.0.0" },
      versions: { "26.0.0": {} },
    };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph registry release 26.0.0 must declare matching version 26.0.0",
    );
  });

  it("rejects a release version that does not match its registry key", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = {
      name: "ts-morph",
      "dist-tags": { latest: "26.0.0" },
      versions: { "26.0.0": { version: "26.0.1" } },
    };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph registry release 26.0.0 must declare matching version 26.0.0",
    );
  });

  it("rejects incomplete reviewed shadcn release metadata", () => {
    const input = approvedInput();
    input.registryMetadata.shadcn = {
      name: "shadcn",
      "dist-tags": { latest: "4.23.0" },
      versions: { "4.23.0": { version: "4.23.0" } },
    };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "shadcn 4.23.0 dependencies must be an object",
    );
  });

  it("rejects the wrong registry package name", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = {
      ...registryMetadata("ts-morph", ["26.0.0"]),
      name: "not-ts-morph",
    };

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      "ts-morph registry package name changed",
    );
  });

  it("rejects SemVer numeric components with leading zeroes", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = registryMetadata(
      "ts-morph",
      ["26.0.0", "26.01.0"],
      "26.0.0",
    );

    expect(() => validateDependencyAuditPolicy(input)).toThrow(
      'ts-morph registry version key "26.01.0" must be valid SemVer',
    );
  });

  it("ignores prereleases beyond the reviewed stable version", () => {
    const input = approvedInput();
    input.registryMetadata["ts-morph"] = registryMetadata(
      "ts-morph",
      ["26.0.0", "26.1.0-beta.1", "26.2.0-rc.1"],
      "26.0.0",
    );

    expect(() => validateDependencyAuditPolicy(input)).not.toThrow();
  });

  it("fails closed when the registry is unavailable", async () => {
    await expect(
      fetchRegistryMetadata("ts-morph", async () => ({
        ok: false,
        status: 503,
        json: async () => ({}),
      })),
    ).rejects.toThrow(
      "npm registry request for ts-morph failed with status 503",
    );
  });

  it("fails closed when the registry returns malformed JSON", async () => {
    await expect(
      fetchRegistryMetadata("ts-morph", async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("unexpected token");
        },
      })),
    ).rejects.toThrow(
      "npm registry response for ts-morph is not valid JSON: unexpected token",
    );
  });
});
