import * as util from "util"; // has no default export;

// @ts-ignore
function replaceMapWithObject(key, value) {
  if (value instanceof Map || value instanceof Set) {
    var obj = {};
    for (let [mapKey, mapValue] of value) {
      // @ts-ignore
      obj[mapKey] = mapValue;
    }
    return obj;
  }
  return value;
}

// @ts-ignore
export function walkFromPath(path: string, tree) {
  const treeObject = convertTreeToObject(tree);

  const pathParts = path.split("/");
  const file = pathParts.pop();
  const tagPath = pathParts;

  // @ts-ignore
  const finalTagNode = tagPath.reduce(
    (node, nodePath) => node.tags[nodePath],
    treeObject.root
  );

  // @ts-ignore
  return finalTagNode.files[file];
}

// @ts-ignore
export function createDeepSnapshot(object) {
  return util.inspect(object, { depth: Infinity });
}

// @ts-ignore
export function convertTreeToObject(objectToSerialize) {
  return JSON.parse(JSON.stringify(objectToSerialize, replaceMapWithObject));
}
