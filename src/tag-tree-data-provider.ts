import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { FileNode } from "./tag-tree/file-node";
import { TagNode } from "./tag-tree/tag-node";
import { TagTree } from "./tag-tree/tag-tree";

class TagTreeDataProvider
  implements
    vscode.TreeDataProvider<TagNode | FileNode> {
  private _onDidChangeFile: vscode.EventEmitter<vscode.FileChangeEvent[]>;
  private tagTree: TagTree;

  constructor() {
    this._onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    this.tagTree = new TagTree();
    this.readAllFilesInWorkspaceFolders();
  }

  /**
   * https://gist.github.com/luciopaiva/4ba78a124704007c702d0293e7ff58dd
   */
  *walkSync(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const pathToFile = path.join(dir, file);
      const isDirectory = fs.statSync(pathToFile).isDirectory();
      if (isDirectory) {
        yield* this.walkSync(pathToFile);
      } else {
        yield pathToFile;
      }
    }
  }

  readAllFilesInWorkspaceFolders() {
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    let files = [];

    // TODO: (bdietz) - this is probably going to be pretty slow
    for(const filePath of this.walkSync(workspaceFolder)) {
      const fileInfo = fs
        .readFileSync(filePath)
        .toString()
        .split("\n")
        .reduce((accumulator,currentLine) => {
          if (currentLine.includes('@nested-tags:')) {
            const tagsToAdd= currentLine
            .split('@nested-tags:').pop()
            .split('-->')[0]
            .split(',')
            return {...accumulator, tags: new Set([...accumulator.tags,...tagsToAdd])};
          }
          return accumulator;
        }, {tags: new Set(), filePath: filePath})
      if (fileInfo.tags.size > 0) {
        files.push(fileInfo);
      }
    }
    for (const fileInfo of files) {
      this.tagTree.addFile(fileInfo.filePath, [...fileInfo.tags], fileInfo.filePath);
    }
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
