import { FileNode } from "./file-node";

class TagNode {
  public tags: Map<string, TagNode>;
  public files: Map<string, FileNode>;

  public displayName: string;
  public tag: string;
  public pathToNode: string;

  constructor(tag: string, pathToNode: string, displayName = "") {
    this.displayName = displayName;
    this.files = new Map<string, FileNode>();
    this.pathToNode = pathToNode;
    this.tag = tag;
    this.tags = new Map<string, TagNode>();
  }

  public addTag(tag: string, pathToNode: string, displayName = tag) {
    this.tags.set(tag, new TagNode(tag, pathToNode, displayName));
  }

  public getTag(tag: string) {
    return this.tags.get(tag);
  }

  public deleteTag(tag: string) {
    this.tags.delete(tag);
  }

  public hasFile(key: string) {
    return this.files.has(key);
  }

  public addFile(node: FileNode) {
    this.files.set(node.key, node);
  }
}

export { TagNode };
