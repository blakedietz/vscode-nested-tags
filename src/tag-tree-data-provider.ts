import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { FileNode } from "./tag-tree/file-node";
import { TagNode } from "./tag-tree/tag-node";
import { TagTree } from "./tag-tree/tag-tree";

function setsAreEqual(aS,bS) {
  if (aS.size !== bS.size) {
    return false;
  }

  for (const a of aS) {
    if (!bS.has(a)) {
      return false;
    }
  }

  return true;
}

class TagTreeDataProvider
  implements vscode.TreeDataProvider<TagNode | FileNode> {
  private tagTree: TagTree;
  private _onDidChangeTreeData: vscode.EventEmitter< TagNode | FileNode | null> = new vscode.EventEmitter<TagNode | FileNode | null>();
  // An optional event to signal that an element or root has changed.
  // This will trigger the view to update the changed element/root and its children recursively (if shown).
  // To signal that root has changed, do not pass any argument or pass undefined or null.
  // TODO: (bdietz) - I wonder if this is going to need to be of the type <TagNode | FileNode>
  readonly onDidChangeTreeData: vscode.Event< TagNode | FileNode | null> = this._onDidChangeTreeData.event;

  constructor() {
    // vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
    // vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));
    // vscode.workspace.onDidSaveTextDocument((e) => {
    //   console.log(e);
    // });

    vscode.workspace.onWillSaveTextDocument((e) => {
      this.onWillSaveTextDocument(e);
    });

    this.tagTree = new TagTree();

    this.readAllFilesInWorkspaceFolders();
  }

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

  public getTreeItem(element: TagNode | FileNode): vscode.TreeItem {
    const tagTreeNode = this.tagTree.getNode(element.pathToNode);
    const { displayName } = tagTreeNode;
    const isFile = tagTreeNode instanceof FileNode;

    const collapsibleState = isFile
      ? vscode.TreeItemCollapsibleState.None
      : vscode.TreeItemCollapsibleState.Collapsed;

    return new vscode.TreeItem(displayName, collapsibleState);
  }

  // private parseTree(): void {
  //   this.text = '';
  //   this.tree = null;
  //   this.editor = vscode.window.activeTextEditor;
  //   if (this.editor && this.editor.document) {
  //     this.text = this.editor.document.getText();
  //     this.tree = json.parseTree(this.text);
  //   }
  // }

  // private refresh(offset?: number): void {
  //   this.parseTree();
  //   if (offset) {
  //     this._onDidChangeTreeData.fire(offset);
  //   } else {
  //     this._onDidChangeTreeData.fire();
  //   }
  // }

  private onWillSaveTextDocument(changeEvent: vscode.TextDocumentWillSaveEvent) {
    if (changeEvent.document.isDirty) {
      console.log('Fix this');
      console.trace();
      this.updateTreeForFile(changeEvent.document.fileName);
    }
  }

  private onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): void {
    // console.log('onDocumentChanged', changeEvent);
    // if (this.autoRefresh && changeEvent.document.uri.toString() === this.editor.document.uri.toString()) {
    //   for (const change of changeEvent.contentChanges) {
    //     const path = json.getLocation(this.text, this.editor.document.offsetAt(change.range.start)).path;
    //     path.pop();
    //     const node = path.length ? json.findNodeAtLocation(this.tree, path) : void 0;
    //     this.parseTree();
    //     this._onDidChangeTreeData.fire(node ? node.offset : void 0);
    //   }
    // }
  }

  // private onActiveEditorChanged(): void {
  //   console.log('onActiveEditorChanged');
  //   if (vscode.window.activeTextEditor) {
  //     if (vscode.window.activeTextEditor.document.uri.scheme === 'file') {
  //       const enabled = vscode.window.activeTextEditor.document.languageId === 'json' || vscode.window.activeTextEditor.document.languageId === 'jsonc';
  //       vscode.commands.executeCommand('setContext', 'jsonOutlineEnabled', enabled);
  //       if (enabled) {
  //         this.refresh();
  //       }
  //     }
  //   } else {
  //     vscode.commands.executeCommand('setContext', 'jsonOutlineEnabled', false);
  //   }
  // }

 /**
  * Stole this from https://gist.github.com/luciopaiva/4ba78a124704007c702d0293e7ff58dd
  */
 // TODO: (bdietz) - come up with a better name for this
  private *walkSync(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const pathToFile = path.join(dir, file);
      const isDirectory = fs.statSync(pathToFile).isDirectory();
      if (isDirectory) {
        yield* this.walkSync(pathToFile);
      } else {
        yield pathToFile;
      }
    }
  }

  private updateTreeForFile(filePath: string) {
      const fileInfo = this.getTagsFromFile(filePath);
      const tagsInTreeForFile = this.tagTree.getTagsForFile(filePath);
      const isUpdateNeeded = !setsAreEqual(fileInfo.tags, tagsInTreeForFile);
      if (isUpdateNeeded) {
        // TODO: (bdietz) - delete node
        // TODO: (bdietz) - add node
      }
  }

  // TODO: (bdietz) - the method name is kind of misleading because it returns both filePath and tags
  private getTagsFromFile(filePath: string) {
      const fileInfo = fs
        .readFileSync(filePath)
        .toString()
        .split("\n")
        .reduce((accumulator,currentLine) => {
          if (currentLine.includes('@nested-tags:')) {
            const tagsToAdd = currentLine
            .split('@nested-tags:').pop()
            .split('-->')[0]
            .split(',')
            return {...accumulator, tags: new Set([...accumulator.tags,...tagsToAdd])};
          }
          return accumulator;
        }, {tags: new Set(), filePath: filePath});
    return fileInfo;
  }

  private readAllFilesInWorkspaceFolders() {
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    let files = [];

    // TODO: (bdietz) - this is probably going to be pretty slow
    for(const filePath of this.walkSync(workspaceFolder)) {
    const fileInfo = this.getTagsFromFile(filePath);

      if (fileInfo.tags.size > 0) {
        files.push(fileInfo);
      }
    }

    for (const fileInfo of files) {
      this.tagTree.addFile(fileInfo.filePath, [...fileInfo.tags], fileInfo.filePath);
    }
  }
}

export { TagTreeDataProvider };
