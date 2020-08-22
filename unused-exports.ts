import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";

const log = (message: string): void => {
  // tslint:disable-next-line: no-console
  console.log(message);
};

const logEmptyLine = (): void => {
  log("");
};

const findAllTypeScriptFiles = (directory: string): readonly string[] => {
  const files = readdirSync(directory);

  return files.reduce<readonly string[]>((allFiles, file) => {
    const path = resolve(join(directory, file));
    const stat = statSync(path);

    if (stat.isFile()) {
      if (!/\.tsx?$/.test(path)) {
        return allFiles;
      }

      return [...allFiles, path];
    }

    if (stat.isDirectory()) {
      return [...allFiles, ...findAllTypeScriptFiles(path)];
    }

    return allFiles;
  }, []);
};

const matchAll = (text: string, pattern: RegExp): readonly string[][] => {
  const matches: string[][] = [];

  while (true) {
    const match = pattern.exec(text);

    if (match == null) {
      break;
    }

    matches.push(match);
  }

  return matches;
};

const resolveModuleNameToPath = (name: string): string => {
  const possibleNames = [
    name,
    `${name}.ts`,
    `${name}.tsx`,
    join(name, "index.ts"),
    join(name, "index.tsx"),
  ];

  for (const possibleName of possibleNames) {
    if (existsSync(possibleName)) {
      const stat = statSync(possibleName);

      if (stat.isFile()) {
        return possibleName;
      }
    }
  }

  throw new Error(`unable to resolve ${name}`);
};

interface IImport {
  readonly path: string;
  readonly symbols: readonly string[];
}

interface IFile {
  readonly path: string;
  readonly imports: readonly IImport[];
  readonly exports: readonly string[];
}

type IProject = Map<string, IFile>;

const buildProject = (directory: string): IProject => {
  const paths = findAllTypeScriptFiles(directory);
  const project = new Map<string, IFile>();

  for (const path of paths) {
    const parentDirectory = dirname(path);
    const text = readFileSync(path).toString();

    const allImports = [
      ...matchAll(text, /import {([^}]+)} from "([^"]+)";/gm),
      ...matchAll(text, /import type {([^}]+)} from "([^"]+)";/gm),
      ...matchAll(text, /const {([^}]+)} = await import\("([^"]+)"\);/gm),
    ];

    const importedSymbols = allImports
      .map((match) => ({
        module: match[2],
        symbols: match[1].split(",").map((symbol) => symbol.trim()),
      }))
      .filter(({ module }) => module.startsWith("."))
      .map<IImport>(({ module, symbols }) => ({
        path: resolveModuleNameToPath(resolve(parentDirectory, module)),
        symbols,
      }));

    const exportedSymbols = matchAll(
      text,
      /export (enum|const enum|const|class|function|type|interface) ([A-Za-z0-9]+)/gm,
    ).map((match) => match[2]);

    project.set(path, {
      exports: exportedSymbols,
      imports: importedSymbols,
      path,
    });
  }

  return project;
};

interface IExport {
  path: string;
  exports: readonly string[];
}

const findUnusedExports = (directory: string): readonly IExport[] => {
  const project = buildProject(directory);

  for (const file of project.values()) {
    for (const { path, symbols } of file.imports) {
      const importedFile = project.get(path);

      if (importedFile == null) {
        // we imported a file not known in this project, e.g., a backend file in
        // the frontend project
        continue;
      }

      project.set(path, {
        ...importedFile,
        exports: importedFile.exports.filter(
          (exportedSymbol) => !symbols.includes(exportedSymbol),
        ),
      });
    }
  }

  return [...project.values()]
    .filter(({ exports }) => exports.length > 0)
    .map<IExport>(({ path, exports }) => ({ path, exports }));
};

const logUnusedExportsCount = (exports: readonly IExport[]): void => {
  const fileCount = exports.length;
  const totalCount = exports.reduce(
    (sum, file) => sum + file.exports.length,
    0,
  );

  log(
    `found ${totalCount} potentially unused export(s) across ${fileCount} file(s)`,
  );
};

const logUnusedExports = (exports: readonly IExport[]): void => {
  for (const file of exports) {
    log(file.path);

    for (const symbol of file.exports) {
      log(`- ${symbol}`);
    }

    logEmptyLine();
  }
};

const unusedFrontendExports = findUnusedExports("./frontend/src");
const unusedBackendExports = findUnusedExports("./backend/src")
  .map(({ path, exports }) => ({
    exports: exports.filter((symbol) => {
      const isService = symbol.endsWith("Service");
      const isController = symbol.endsWith("Controller");
      const isInterceptor = symbol.endsWith("Interceptor");
      const isMiddleware = symbol.endsWith("Middleware");
      const isError = symbol.endsWith("Error");

      return (
        !isService &&
        !isController &&
        !isInterceptor &&
        !isMiddleware &&
        !isError
      );
    }),
    path,
  }))
  .filter(({ exports, path }) => {
    const isEmpty = exports.length === 0;
    const isExportedAPI =
      path.endsWith("controllers/dto.ts") ||
      path.endsWith("controllers/api.ts");

    return !isEmpty && !isExportedAPI;
  });

logUnusedExportsCount([...unusedFrontendExports, ...unusedBackendExports]);
logEmptyLine();
logUnusedExports(unusedFrontendExports);
logUnusedExports(unusedBackendExports);
