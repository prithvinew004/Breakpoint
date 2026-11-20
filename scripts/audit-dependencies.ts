import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import {
  exceptionExpiresOn,
  fetchRegistryMetadata,
  validateDependencyAuditPolicy,
} from "./dependency-audit-policy";

const repositoryRoot = join(import.meta.dirname, "..");

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function run(command: string[]): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  const result = Bun.spawnSync(command, { cwd: repositoryRoot });
  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString().trim(),
    stderr: result.stderr.toString().trim(),
  };
}

function record(value: unknown, label: string): Record<string, unknown> {
  invariant(
    typeof value === "object" && value !== null && !Array.isArray(value),
    `${label} must be an object`,
  );
  return value as Record<string, unknown>;
}

function packageJson(
  requireFromPackage: NodeJS.Require,
  packageName: string,
): Record<string, unknown> {
  const entry = requireFromPackage.resolve(packageName);
  let directory = join(entry, "..");

  while (directory !== repositoryRoot) {
    try {
      const parsed = record(
        JSON.parse(readFileSync(join(directory, "package.json"), "utf8")),
        `${packageName} package.json`,
      );
      if (parsed.name === packageName) return parsed;
    } catch (error) {
      if (
        !(error instanceof Error && "code" in error && error.code === "ENOENT")
      )
        throw error;
    }
    directory = join(directory, "..");
  }

  throw new Error(`Could not locate ${packageName}/package.json`);
}

function verifyDependencyPath(): {
  shadcnRequire: NodeJS.Require;
  tsMorphRequire: NodeJS.Require;
  commonRequire: NodeJS.Require;
} {
  const webRequire = createRequire(
    join(repositoryRoot, "apps/web/package.json"),
  );
  const shadcn = packageJson(webRequire, "shadcn");
  invariant(shadcn.version === "4.23.0", "shadcn version changed");
  invariant(
    record(shadcn.dependencies, "shadcn dependencies")["ts-morph"] ===
      "^26.0.0",
    "shadcn's ts-morph range changed",
  );

  const shadcnRequire = createRequire(webRequire.resolve("shadcn"));
  const tsMorph = packageJson(shadcnRequire, "ts-morph");
  invariant(tsMorph.version === "26.0.0", "ts-morph version changed");
  invariant(
    record(tsMorph.dependencies, "ts-morph dependencies")[
      "@ts-morph/common"
    ] === "~0.27.0",
    "ts-morph's common range changed",
  );

  const tsMorphRequire = createRequire(shadcnRequire.resolve("ts-morph"));
  const common = packageJson(tsMorphRequire, "@ts-morph/common");
  invariant(common.version === "0.27.0", "@ts-morph/common version changed");
  invariant(
    record(common.dependencies, "common dependencies").minimatch === "^10.0.1",
    "common's minimatch range changed",
  );

  const commonRequire = createRequire(
    tsMorphRequire.resolve("@ts-morph/common"),
  );
  const minimatch = packageJson(commonRequire, "minimatch");
  invariant(minimatch.version === "10.2.6", "minimatch version changed");

  return { shadcnRequire, tsMorphRequire, commonRequire };
}

function occurrences(source: string, fragment: string): number {
  return source.split(fragment).length - 1;
}

function verifyCallPath({
  shadcnRequire,
  tsMorphRequire,
  commonRequire,
}: ReturnType<typeof verifyDependencyPath>): void {
  const tsMorphSource = readFileSync(shadcnRequire.resolve("ts-morph"), "utf8");
  const commonSource = readFileSync(
    tsMorphRequire.resolve("@ts-morph/common"),
    "utf8",
  );
  const minimatchSource = readFileSync(
    commonRequire.resolve("minimatch"),
    "utf8",
  );

  invariant(
    occurrences(tsMorphSource, "common.matchGlobs(") === 2,
    "ts-morph matchGlobs call sites changed",
  );
  invariant(
    occurrences(
      commonSource,
      "minimatch__namespace.minimatch(path, pattern)",
    ) === 2,
    "common's two-argument minimatch calls changed",
  );
  invariant(
    !tsMorphSource.includes("optimizationLevel") &&
      !commonSource.includes("optimizationLevel"),
    "a consumer now sets minimatch optimizationLevel",
  );
  invariant(
    occurrences(
      minimatchSource,
      "const { optimizationLevel = 1 } = this.options;",
    ) === 2,
    "minimatch's default optimization level changed",
  );
  invariant(
    occurrences(minimatchSource, "if (optimizationLevel >= 2) {") === 2,
    "minimatch's level-2 gate changed",
  );

  const minimatchModule = commonRequire("minimatch") as {
    minimatch: (...arguments_: unknown[]) => boolean;
  };
  const originalMinimatch = minimatchModule.minimatch;
  const argumentCounts: number[] = [];
  minimatchModule.minimatch = (...arguments_) => {
    argumentCounts.push(arguments_.length);
    return originalMinimatch(...arguments_);
  };

  try {
    const { Project } = shadcnRequire("ts-morph") as {
      Project: new (options: {
        useInMemoryFileSystem: boolean;
      }) => {
        createSourceFile(path: string, source: string): unknown;
        getSourceFiles(pattern: string): unknown[];
      };
    };
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("/src/example.ts", "export const example = true;");
    project.getSourceFiles("/src/**/*.ts");
  } finally {
    minimatchModule.minimatch = originalMinimatch;
  }

  invariant(
    argumentCounts.length > 0 && argumentCounts.every((count) => count === 2),
    "the runtime minimatch call configuration changed",
  );
}

async function main(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const audit = run(["bun", "audit", "--json"]);
  invariant(
    audit.exitCode === 0 || audit.exitCode === 1,
    `bun audit failed: ${audit.stderr || audit.stdout}`,
  );
  const dependencyWhy = run(["bun", "pm", "why", "minimatch"]);
  invariant(
    dependencyWhy.exitCode === 0,
    `bun pm why minimatch failed: ${dependencyWhy.stderr}`,
  );
  const [shadcnMetadata, tsMorphMetadata, commonMetadata] = await Promise.all([
    fetchRegistryMetadata("shadcn"),
    fetchRegistryMetadata("ts-morph"),
    fetchRegistryMetadata("@ts-morph/common"),
  ]);

  validateDependencyAuditPolicy({
    auditOutput: audit.stdout,
    dependencyWhy: dependencyWhy.stdout,
    today,
    registryMetadata: {
      shadcn: shadcnMetadata,
      "ts-morph": tsMorphMetadata,
      "@ts-morph/common": commonMetadata,
    },
  });

  const dependencyPath = verifyDependencyPath();
  verifyCallPath(dependencyPath);

  console.log(
    `Dependency audit passed: exact minimatch exception valid through ${exceptionExpiresOn}; picomatch has no active exception.`,
  );
}

await main();
