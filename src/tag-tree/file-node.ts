class FileNode {
  // The name that should be displayed when viewing in the ui
  public displayName: string;
  // The absolute filepath
  public filePath: string;
  // The tags that are in the file itself;
  public tags: string[];
  public pathToNode: string;
  public key: string;

  constructor(
    key: string,
    filePath: string,
    pathToNode: string,
    tags: string[],
    displayName: string
  ) {
    this.displayName = displayName;
    this.key = key;
    this.filePath = filePath;
    this.pathToNode = `${pathToNode}/${this.key}`;
    this.tags = tags;
  }
}

interface IFileNodeSort {
  (fileA: FileNode, fileB: FileNode): number;
}

const fileNodeSort: IFileNodeSort = (fileA: FileNode, fileB: FileNode) => {
  if (fileA.filePath < fileB.filePath) {
    return -1;
  } else if (fileA.filePath > fileB.filePath) {
    return 1;
  } else {
    return 0;
  }
};

export { FileNode, fileNodeSort };
