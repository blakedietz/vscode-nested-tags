class FileNode {
  // The name that should be displayed when viewing in the ui
  public displayName: string;
  // The absolute filepath
  public filePath: string;
  // The tags that are in the file itself;
  public tags: string[];
  public pathToNode: string;

  constructor(
    filePath: string,
    pathToNode: string,
    tags: string[],
    displayName: string
  ) {
    this.displayName = displayName;
    this.filePath = filePath;
    this.pathToNode = `${pathToNode}/${filePath}`;
    this.tags = tags;
  }
}

export { FileNode };
