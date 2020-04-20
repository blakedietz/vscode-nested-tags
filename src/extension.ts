// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TagTreeView } from "./tag-tree-view";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  //Custom command to open a file and jump to a line and focus the editor
  vscode.commands.registerCommand('extension.jumpToLine', mySelectedNode => {
    //Open the file and select the proper tag line
    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(mySelectedNode.filePath)).then(function () {
      setTimeout(function () {
        //Jump to Tag and focus the lines in screen
        var editor = vscode.window.activeTextEditor;
        if (editor != undefined) {
          //parse the line number from the tree 'LineNum(X)' text
          var endInt = mySelectedNode.pathToNode.indexOf(')', 0);
          if (endInt > 0) { //Check for LineNum for the new tag objects
            var lineno = parseInt(mySelectedNode.pathToNode.split("/LineNum(")[1].substring(0, endInt)) - 1;
            var selectLine: vscode.Selection = new vscode.Selection(lineno, 0, lineno, 0);
            var tagSelections: vscode.Selection[] = [selectLine];
            if (editor.document.uri.path.length > 0) {
              editor.selections = tagSelections;
              vscode.commands.executeCommand('revealLine', { lineNumber: lineno, at: 'middle' });
            }
          }
        }
        else {
          vscode.window.showInformationMessage('Undefined editor window.');
        }
      }, 300);
    });
  });
  new TagTreeView(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }