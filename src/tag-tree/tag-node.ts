import { FileNode } from "./file-node";

class TagNode {
  public tags: Map<string, TagNode>;
  public files: Map<string, FileNode>;

  public displayName: string;
  public tag: string;

  constructor(tag: string, displayName = "") {
    this.displayName = displayName;
    this.files = new Map<string, FileNode>();
    this.tag = tag;
    this.tags = new Map<string, TagNode>();
  }

  public addTag(tag: string, displayName = tag) {
    this.tags.set(tag, new TagNode(tag, displayName));
  }

  public getTag(tag: string) {
    return this.tags.get(tag);
  }

  public deleteTag(tag: string) {
    this.tags.delete(tag);
  }

  public hasFile(filePath: string) {
    return this.files.has(filePath);
  }

  public addFile(node: FileNode) {
    this.files.set(node.filePath, node);
  }
}

export { TagNode };
