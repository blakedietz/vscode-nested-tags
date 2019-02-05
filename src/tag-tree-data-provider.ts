import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { setsAreEqual } from "./sets";
import { FileNode } from "./tag-tree/file-node";
import { TagNode } from "./tag-tree/tag-node";
import { TagTree } from "./tag-tree/tag-tree";

interface IFileInfo {
  tags: Set<string>;
  filePath: string;
}

class TagTreeDataProvider
  implements vscode.TreeDataProvider<TagNode | FileNode> {
  private tagTree: TagTree;
  // Responsible for notifying the TreeDataProvider to update for the specified element in tagTree
  private _onDidChangeTreeData: vscode.EventEmitter< TagNode | FileNode | null> = new vscode.EventEmitter<TagNode | FileNode | null>();
  /*
   * An optional event to signal that an element or root has changed.
   * This will trigger the view to update the changed element/root and its children recursively (if shown).
   * To signal that root has changed, do not pass any argument or pass undefined or null.
   */
  readonly onDidChangeTreeData: vscode.Event< TagNode | FileNode | null> = this._onDidChangeTreeData.event;

  constructor() {
    // vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
    // vscode.workspace.onDidSaveTextDocument((e) => {
    //   console.log(e);
    // });

    // Register the extension to events of interest
    vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));
    vscode.workspace.onWillSaveTextDocument((e) => {
      this.onWillSaveTextDocument(e);
    });

    this.tagTree = new TagTree();

    // Add all files in the current workspace folder to the tag tree
    // @ts-ignore
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const files = [];

    // TODO: (bdietz) - this is probably going to be pretty slow
    for(const filePath of this.walkFileSystemSync(workspaceFolder)) {
    const fileInfo = this.getTagsFromFileOnFileSystem(filePath);
      if (fileInfo.tags.size > 0) {
        files.push(fileInfo);
      }
    }

    for (const fileInfo of files) {
      this.tagTree.addFile(fileInfo.filePath, [...fileInfo.tags], fileInfo.filePath);
    }
  }

  /**
   * Required for implementing TreeDataProvider interface.
   *
   * @param {(TagNode | FileNode)} element
   * @returns
   * @memberof TagTreeDataProvider
   */
  public getChildren(element: TagNode | FileNode) {
    if (element instanceof FileNode) {
      return [];
    } else if (element === undefined) {
      return [
        ...this.tagTree.root.tags.values(),
        ...this.tagTree.root.files.values()
      ];
    } else {
      return [...element.tags.values(), ...element.files.values()];
    }
  }

  /**
   * Required for implementing TreeDataProvider interface.
   *
   * @param {(TagNode | FileNode)} element
   * @returns {vscode.TreeItem}
   * @memberof TagTreeDataProvider
   */
  public getTreeItem(element: TagNode | FileNode): vscode.TreeItem {
    const tagTreeNode = this.tagTree.getNode(element.pathToNode);
    const { displayName } = tagTreeNode;
    const isFile = tagTreeNode instanceof FileNode;

    const collapsibleState = isFile
      ? vscode.TreeItemCollapsibleState.None
      : vscode.TreeItemCollapsibleState.Collapsed;

    return new vscode.TreeItem(displayName, collapsibleState);
  }

  /**
   * Update the ui view if the document that is about to be saved has a different set of tags than
   * what is located in the currentState of the tag tree. This keeps the tree view in sync with
   * any changes to tags for a document before saving.
   * @param changeEvent
   */
  private onWillSaveTextDocument(changeEvent: vscode.TextDocumentWillSaveEvent) {
    if (changeEvent.document.isDirty) {
      const filePath = changeEvent.document.fileName;
      const fileInfo = this.getTagsFromFileOnFileSystem(filePath);
      const tagsInTreeForFile = this.tagTree.getTagsForFile(filePath);
      this.updateTreeForFile(filePath, tagsInTreeForFile, fileInfo.tags);
    }
  }

  /**
   * Updates the tagTree and the ui tree view upon _every_ _single_ _change_ (saved or unsaved)
   * to a document. This method helps to keep the tag contents of the document in sync with the
   * tag tree view in the UI. This method fires for documents that have already been written to
   * the file system or are still in memory.
   *
   * @param changeEvent
   */
  private onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): void {
    const filePath = changeEvent.document.fileName;
    const fileInfo = this.getTagsFromFileText(changeEvent.document.getText(), filePath);
    const tagsInTreeForFile = this.tagTree.getTagsForFile(filePath);
    const isUpdateNeeded = !setsAreEqual(fileInfo.tags, tagsInTreeForFile);
    /*
     * This could be potentially performance intensive due to the number of changes that could
     * be made to a document and how large the document is. There will definitely need to be some
     * work done around TagTree to make sure that the code
     */
    if (isUpdateNeeded) {
      this.tagTree.deleteFile(filePath);
      this.tagTree.addFile(filePath, [...fileInfo.tags.values()], filePath);
      // TODO: (bdietz) - this._onDidChangeTreeData.fire(specificNode?)
      this._onDidChangeTreeData.fire();
    }
  }

 /**
  * NOTE: Stole this from https://gist.github.com/luciopaiva/4ba78a124704007c702d0293e7ff58dd.
  *
  * Recursively walk through the file system synchronously.
  */
  private *walkFileSystemSync(dir: string): IterableIterator<string> {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const pathToFile = path.join(dir, file);
      const isDirectory = fs.statSync(pathToFile).isDirectory();
      if (isDirectory) {
        yield* this.walkFileSystemSync(pathToFile);
      } else {
        yield pathToFile;
      }
    }
  }

  /**
   *
   * @param filePath The uri path to the file
   * @param tagsBefore The tags before a change to the document
   * @param tagsAfter The tags after a change to the document
   */
  private updateTreeForFile(filePath: string, tagsBefore: Set<string>, tagsAfter: Set<string>) {
      const isUpdateNeeded = !setsAreEqual(tagsBefore, tagsAfter);
      if (isUpdateNeeded) {
        this.tagTree.deleteFile(filePath);
        this.tagTree.addFile(filePath, [...tagsAfter.values()], filePath);
        /*
         * TODO (bdietz) - this._onDidChangeTreeData.fire(specificNode?)
         * specifying the specific node would help to improve the efficiency of the tree refresh.
         * Right now null/undefined being passed in fires off a refresh for the root of the tag tree.
         * I wonder if all the parents that have been impacted should be returned from the tag tree
         * for a fileDelete.
         */
        this._onDidChangeTreeData.fire();
      }
  }

  // TODO: (bdietz) - the method names of getTagsFrom* are kind of misleading because they return a FileInfo object.

  /**
   * Retrieves tags for a file's text content without accessing the file system.
   *
   * @param fileContents The document text
   * @param filePath The local filesystem path
   */
  private getTagsFromFileText(fileContents: string, filePath: string): IFileInfo {
    return fileContents
        .split("\n")
        .reduce((accumulator, currentLine) => {
          if (currentLine.includes('@nested-tags:')) {
            // @ts-ignore
            const tagsToAdd = currentLine
            .split('@nested-tags:')
            .pop()
            .split('-->')[0]
            .split(',');
            return {...accumulator, tags: new Set([...accumulator.tags,...tagsToAdd])};
          }
          return accumulator;
        }, { tags: new Set(), filePath });
  }

  /**
   * Retrieves tags for a file on the file system.
   *
   * @param filePath The local filesystem path
   */
  private getTagsFromFileOnFileSystem(filePath: string): IFileInfo {
      return this.getTagsFromFileText(fs.readFileSync(filePath).toString(), filePath);
    }
}

export { TagTreeDataProvider };
