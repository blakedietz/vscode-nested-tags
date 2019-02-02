import { FileNode } from "./file-node";
import { TagNode } from "./tag-node";

class TagTree {
  private root: TagNode;
  private fileIndex: Map<string, TagNode[]>;

  constructor() {
    this.root = new TagNode("");
    this.fileIndex = new Map();
  }

  public addFile(filePath: string, tags: string[], displayName: string) {
    for (const tag of tags) {
      this.addFileNode(tag, new FileNode(filePath, tags, displayName));
    }
  }

  public deleteFile(path: string): void {
    if (!this.fileIndex.has(path)) {
      return;
    }
  }

  private addFileNode(tagPath: string, fileNode: FileNode): void {
    /**
     * Given a tag path, the tags that lead up to the file may not exist in the tag tree continue down the path
     * building the parts of the tree that don't exist one node at a time
     */
    const nodeToAddFileTo = tagPath
      .split("/")
      .reduce((currentNode, pathToAdd) => {
        if (currentNode.getTag(pathToAdd) !== undefined) {
          return currentNode.getTag(pathToAdd)!;
        }
        // The node has not had this tag added yet so make sure one exists
        else {
          currentNode.addTag(pathToAdd);
          return currentNode.getTag(pathToAdd)!;
        }
      }, this.root);

    /**
     * At this point, the tag tree has been built and we can just add the file to the
     * tag tree
     */
    nodeToAddFileTo.addFile(fileNode);
    if (!this.fileIndex.has(fileNode.filePath)) {
      this.fileIndex.set(fileNode.filePath, [nodeToAddFileTo]);
    } else {
      const nodesForFile = this.fileIndex.get(fileNode.filePath)!;
      this.fileIndex.set(fileNode.filePath, [...nodesForFile, nodeToAddFileTo]);
    }
  }
}

export { TagTree };
