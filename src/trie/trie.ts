import { TagNode } from "./tag-node";
import { FileNode } from "./file-node";

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
    let currentNode = this.root;
    const partsToAdd = tagPath.split("/").reverse();
    while (partsToAdd.length > 0) {
      const pathToAdd = String(partsToAdd.pop());

      // Node already has the tag use that tag instead
      if (currentNode.getTag(pathToAdd) !== undefined) {
        currentNode = currentNode.getTag(pathToAdd)!;
      }
      // The node has not had this tag added yet so make sure one exists
      else {
        currentNode.addTag(pathToAdd);
        currentNode = currentNode.getTag(pathToAdd)!;
      }
    }

    /**
     * At this point, the tag tree has been built and we can just add the file to the
     * tag tree
     */
    currentNode.addFile(fileNode);
    if (!this.fileIndex.has(fileNode.filePath)) {
      this.fileIndex.set(fileNode.filePath, [currentNode]);
    } else {
      const nodesForFile = this.fileIndex.get(fileNode.filePath)!;
      this.fileIndex.set(fileNode.filePath, [...nodesForFile, currentNode]);
    }
  }
}

export { TagTree };
