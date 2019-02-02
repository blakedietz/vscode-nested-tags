import { TagTree } from "./tag-tree/tag-tree";
import { TagNode } from "./tag-tree/tag-node";
import { FileNode } from "./tag-tree/file-node";
import * as vscode from "vscode";

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
    } else {
      return [...element.tags.values(), ...element.files.values()];
    }
  }

  public getTreeItem(element: TagNode | FileNode): vscode.TreeItem {
    const tagTreeNode = this.tagTree.getNode(element.pathToNode);
    const { displayName } = tagTreeNode;
    const isFile = tagTreeNode instanceof FileNode;

    return {
      // @ts-ignore
      label: <vscode.TreeItemLabel>{
        label: displayname,
        highlights:
          displayname.length > 1
            ? [[displayname.length - 2, displayname.length - 1]]
            : void 0
      },
      tooltip: `Tooltip for ${displayName}`,
      collapsibleState: isFile
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed
    };
  }
}

export { TagTreeDataProvider };
