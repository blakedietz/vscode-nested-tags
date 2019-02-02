import { TagNode } from "./tag-node";
import { FileNode } from "./file-node";

class TagTree {
  public root: TagNode;
  private fileIndex: Map<string, TagNode[]>;

  constructor() {
    this.root = new TagNode("", "");
    this.fileIndex = new Map();
  }

  public addFile(filePath: string, tags: string[], displayName: string) {
    for (const tag of tags) {
      this.addFileNode(tag, new FileNode(filePath, tag, tags, displayName));
    }
  }

  public deleteFile(path: string): void {
    if (!this.fileIndex.has(path)) {
      return;
    }
  }

  public getNode(nodePath: string) {
    // @ts-ignore
    return nodePath.split("/").reduce((currentNode, pathPart) => {
      // Must be looking at a file
      if (pathPart.includes(".")) {
        return currentNode.files.get(pathPart);
      } else {
        return currentNode.tags.get(pathPart);
      }
    }, this.root);
  }

  private addFileNode(tagPath: string, fileNode: FileNode): void {
    /**
     * Given a tag path, the tags that lead up to the file may not exist in the tag tree continue down the path
     * building the parts of the tree that don't exist one node at a time
     */
    const nodeToAddFileTo = tagPath.split("/").reduce(
      ({ currentNode, currentPath }, pathToAdd) => {
        const newCurrentPath =
          currentPath === "" ? pathToAdd : `${currentPath}/${pathToAdd}`;

        if (currentNode.getTag(pathToAdd) !== undefined) {
          return {
            currentNode: currentNode.getTag(pathToAdd)!,
            currentPath: newCurrentPath
          };
        }
        // The node has not had this tag added yet so make sure one exists
        else {
          currentNode.addTag(pathToAdd, newCurrentPath);
          return {
            currentNode: currentNode.getTag(pathToAdd)!,
            currentPath: newCurrentPath
          };
        }
      },
      { currentNode: this.root, currentPath: "" }
    ).currentNode;

    /**
     * At this point, the tag tree has been built and we can just add the file to the
     * tag tree
     */
    nodeToAddFileTo.addFile(fileNode);
    if (!this.fileIndex.has(fileNode.key)) {
      this.fileIndex.set(fileNode.key, [nodeToAddFileTo]);
    } else {
      const nodesForFile = this.fileIndex.get(fileNode.key)!;
      this.fileIndex.set(fileNode.key, [...nodesForFile, nodeToAddFileTo]);
    }
  }
}

export { TagTree };
