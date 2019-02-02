import * as vscode from "vscode";
import { FileNode } from "./tag-tree/file-node";
import { TagNode } from "./tag-tree/tag-node";
import { TagTree } from "./tag-tree/tag-tree";

class TagTreeDataProvider
  implements vscode.TreeDataProvider<TagNode | FileNode> {
  private tagTree: TagTree;

  constructor() {
    this.tagTree = new TagTree();
    this.tagTree.addFile("foo.md", ["hello"], "foo.md");
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
