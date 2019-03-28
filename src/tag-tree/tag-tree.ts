import { TagNode } from "./tag-node";
import { FileNode } from "./file-node";

class TagTree {
  public root: TagNode;
  private fileIndex: Map<string, TagNode[]>;

  constructor() {
    this.root = new TagNode(null, "", "");
    this.fileIndex = new Map();
  }

  /// TODO:(bdietz) - figure out if this method supports adding a file multiple times
  public addFile(filePath: string, tags: string[], displayName: string) {
    // TODO: (bdietz) - should it be the file node's job to write its own key?
    for (const tag of tags) {
      const newNode = new FileNode(
        this.createKeyForFile(filePath),
        filePath,
        tag,
        tags,
        displayName
      );
      this.addFileNode(tag, newNode);
    }
  }

  public deleteFile(filePath: string): void {
    const fileKey = this.createKeyForFile(filePath);
    if (!this.fileIndex.has(fileKey)) {
      return;
    }

    const tags = this.fileIndex.get(fileKey);

    for (const tag of tags!) {
      tag.deleteFile(fileKey);
      this.deletePathToFile(tag);
    }
    // After removing all of the nodes in the tree, remove the entry in the file index
    this.fileIndex.delete(fileKey);
  }

  public getTagsForFile(filePath: string) {
    const fileKey = this.createKeyForFile(filePath);
    if (!this.fileIndex.has(fileKey)) {
      return new Set();
    }
    const tagNodes = this.fileIndex.get(fileKey)!;
    return tagNodes.reduce((tags, tagNode) => {
      return tags.add(tagNode.tag);
    }, new Set());
  }

  public getNode(nodePath: string) {
    // @ts-ignore
    return nodePath.split("/").reduce((currentNode, pathPart) => {
      // Must be looking at a file
      if (pathPart.includes(".")) {
        return currentNode.files.get(this.createKeyForFile(pathPart));
      } else {
        return currentNode.tags.get(pathPart);
      }
    }, this.root);
  }

  private addFileNode(tagPath: string, fileNode: FileNode): void {
    /**
     * Given a tag filePath, the tags that lead up to the file may not exist in the tag tree continue down the filePath
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

  private createKeyForFile(filePath: string): string {
    return filePath.replace(/\//g, "|");
  }

  private deletePathToFile(node: TagNode) {
    let currentNode = node;

    while (currentNode!.files.size === 0 && currentNode!.tags.size === 0) {
      const { parent } = currentNode;
      // We're not at the root of the tree yet
      if (parent !== null) {
        parent!.deleteTag(currentNode.tag);
        // @ts-ignore
        currentNode = parent;
      // At this point we've hit the root of the tree
      } else {
        break;
      }
    }
  }
}

export { TagTree };
