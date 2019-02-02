import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as rimraf from "rimraf";
import * as vscode from "vscode";

function handleResult<T>(
  resolve: (result: T) => void,
  reject: (error: Error) => void,
  error: Error | null | undefined,
  result: T
): void {
  if (error) {
    reject(massageError(error));
  } else {
    resolve(result);
  }
}

function massageError(error: Error & { code?: string }): Error {
  if (error.code === "ENOENT") {
    return vscode.FileSystemError.FileNotFound();
  }

  if (error.code === "EISDIR") {
    return vscode.FileSystemError.FileIsADirectory();
  }

  if (error.code === "EEXIST") {
    return vscode.FileSystemError.FileExists();
  }

  if (error.code === "EPERM" || error.code === "EACCESS") {
    return vscode.FileSystemError.NoPermissions();
  }

  return error;
}

export function checkCancellation(token: vscode.CancellationToken): void {
  if (token.isCancellationRequested) {
    throw new Error("Operation cancelled");
  }
}

export function normalizeNFC(items: string): string;
export function normalizeNFC(items: string[]): string[];
export function normalizeNFC(items: string | string[]): string | string[] {
  if (process.platform !== "darwin") {
    return items;
  }

  if (Array.isArray(items)) {
    return items.map(item => item.normalize("NFC"));
  }

  return items.normalize("NFC");
}

export function readdir(path: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(path, (error, children) =>
      handleResult(resolve, reject, error, normalizeNFC(children))
    );
  });
}

export function stat(path: string): Promise<fs.Stats> {
  return new Promise<fs.Stats>((resolve, reject) => {
    fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
  });
}

export function readfile(path: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(path, (error, buffer) =>
      handleResult(resolve, reject, error, buffer)
    );
  });
}

export function writefile(path: string, content: Buffer): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, content, error =>
      handleResult(resolve, reject, error, void 0)
    );
  });
}

export function exists(path: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    fs.exists(path, exists => handleResult(resolve, reject, null, exists));
  });
}

export function rmrf(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    rimraf(path, error => handleResult(resolve, reject, error, void 0));
  });
}

export function mkdir(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    mkdirp(path, error => handleResult(resolve, reject, error, void 0));
  });
}

export function rename(oldPath: string, newPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.rename(oldPath, newPath, error =>
      handleResult(resolve, reject, error, void 0)
    );
  });
}

export function unlink(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(path, error => handleResult(resolve, reject, error, void 0));
  });
}
