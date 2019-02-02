import * as fileSystemHelpers from "./file-system-helpers";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { FileNode } from "./tag-tree/file-node";
import { TagNode } from "./tag-tree/tag-node";
import { TagTree } from "./tag-tree/tag-tree";
import { FileStat } from "./file-stat";

class TagTreeDataProvider
  implements
    vscode.FileSystemProvider,
    vscode.TreeDataProvider<TagNode | FileNode> {
  private _onDidChangeFile: vscode.EventEmitter<vscode.FileChangeEvent[]>;
  private tagTree: TagTree;

  constructor() {
    this._onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    this.tagTree = new TagTree();
    this.tagTree.addFile("foo.md", ["hello/world"], "foo.md");
  }

  get onDidChangeFile(): vscode.Event<vscode.FileChangeEvent[]> {
    return this._onDidChangeFile.event;
  }

  watch(
    uri: vscode.Uri,
    options: { recursive: boolean; excludes: string[] }
  ): vscode.Disposable {
    const watcher = fs.watch(
      uri.fsPath,
      { recursive: options.recursive },
      async (event: string, filename: string | Buffer) => {
        const filepath = path.join(
          uri.fsPath,
          fileSystemHelpers.normalizeNFC(filename.toString())
        );

        this._onDidChangeFile.fire([
          {
            type:
              event === "change"
                ? vscode.FileChangeType.Changed
                : (await fileSystemHelpers.exists(filepath))
                ? vscode.FileChangeType.Created
                : vscode.FileChangeType.Deleted,
            uri: uri.with({ path: filepath })
          } as vscode.FileChangeEvent
        ]);
      }
    );

    return { dispose: () => watcher.close() };
  }

  stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
    return this._stat(uri.fsPath);
  }

  async _stat(path: string): Promise<vscode.FileStat> {
    return new FileStat(await fileSystemHelpers.stat(path));
  }

  readDirectory(
    uri: vscode.Uri
  ): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
    return this._readDirectory(uri);
  }

  async _readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    const children = await fileSystemHelpers.readdir(uri.fsPath);

    const result: [string, vscode.FileType][] = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const stat = await this._stat(path.join(uri.fsPath, child));
      result.push([child, stat.type]);
    }

    return Promise.resolve(result);
  }

  createDirectory(uri: vscode.Uri): void | Thenable<void> {
    return fileSystemHelpers.mkdir(uri.fsPath);
  }

  readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
    return fileSystemHelpers.readfile(uri.fsPath);
  }

  writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean }
  ): void | Thenable<void> {
    return this._writeFile(uri, content, options);
  }

  async _writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean }
  ): Promise<void> {
    const exists = await fileSystemHelpers.exists(uri.fsPath);
    if (!exists) {
      if (!options.create) {
        throw vscode.FileSystemError.FileNotFound();
      }

      await fileSystemHelpers.mkdir(path.dirname(uri.fsPath));
    } else {
      if (!options.overwrite) {
        throw vscode.FileSystemError.FileExists();
      }
    }

    return fileSystemHelpers.writefile(uri.fsPath, content as Buffer);
  }

  delete(
    uri: vscode.Uri,
    options: { recursive: boolean }
  ): void | Thenable<void> {
    if (options.recursive) {
      return fileSystemHelpers.rmrf(uri.fsPath);
    }

    return fileSystemHelpers.unlink(uri.fsPath);
  }

  rename(
    oldUri: vscode.Uri,
    newUri: vscode.Uri,
    options: { overwrite: boolean }
  ): void | Thenable<void> {
    return this._rename(oldUri, newUri, options);
  }

  async _rename(
    oldUri: vscode.Uri,
    newUri: vscode.Uri,
    options: { overwrite: boolean }
  ): Promise<void> {
    const exists = await fileSystemHelpers.exists(newUri.fsPath);
    if (exists) {
      if (!options.overwrite) {
        throw vscode.FileSystemError.FileExists();
      } else {
        await fileSystemHelpers.rmrf(newUri.fsPath);
      }
    }

    const parentExists = await fileSystemHelpers.exists(
      path.dirname(newUri.fsPath)
    );
    if (!parentExists) {
      await fileSystemHelpers.mkdir(path.dirname(newUri.fsPath));
    }

    return fileSystemHelpers.rename(oldUri.fsPath, newUri.fsPath);
  }

  public getChildren(element: TagNode | FileNode) {
    if (element instanceof FileNode) {
      return [];
    } else if (element === undefined) {
      return [
        ...this.tagTree.root.tags.values(),
        ...this.tagTree.root.files.values()
      ];
    } else {
      return [...element.tags.values(), ...element.files.values()];
    }
  }

  public getTreeItem(element: TagNode | FileNode): vscode.TreeItem {
    const tagTreeNode = this.tagTree.getNode(element.pathToNode);
    const { displayName } = tagTreeNode;
    const isFile = tagTreeNode instanceof FileNode;

    const collapsibleState = isFile
      ? vscode.TreeItemCollapsibleState.None
      : vscode.TreeItemCollapsibleState.Collapsed;

    return new vscode.TreeItem(displayName, collapsibleState);
  }
}

export { TagTreeDataProvider };
