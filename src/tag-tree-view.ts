import * as vscode from "vscode";
import { TagTreeDataProvider } from "./tag-tree-data-provider";

class TagTreeView {
  constructor(context: vscode.ExtensionContext) {
    vscode.window.createTreeView("tagTreeView", {
      treeDataProvider: new TagTreeDataProvider()
    });
  }
}

export { TagTreeView };
