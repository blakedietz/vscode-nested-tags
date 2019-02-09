import { FileNode } from "./file-node";

class TagNode {
  public tags: Map<string, TagNode>;
  public files: Map<string, FileNode>;
  public parent: TagNode | null;

  public displayName: string;
  public tag: string;
  public pathToNode: string;

  constructor(
    parent = null,
    tag: string,
    pathToNode: string,
    displayName = ""
  ) {
    this.parent = parent;
    this.displayName = displayName;
    this.files = new Map<string, FileNode>();
    this.pathToNode = pathToNode;
    this.tag = tag;
    this.tags = new Map<string, TagNode>();
  }

  public addTag(tag: string, pathToNode: string, displayName = tag) {
    // @ts-ignore
    this.tags.set(tag, new TagNode(this, tag, pathToNode, displayName));
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

  public deleteFile(fileKey: string) {
    this.files.delete(fileKey);
  }
}

interface ITagNodeSort {
  (tagA: TagNode, tagB: TagNode): number;
}
const tagNodeSort: ITagNodeSort = (tagA: TagNode, tagB: TagNode) => {
  if (tagA.tag < tagB.tag) {
    return -1;
  } else if (tagA.tag > tagB.tag) {
    return 1;
  } else {
    return 0;
  }
};

export { TagNode, tagNodeSort };
