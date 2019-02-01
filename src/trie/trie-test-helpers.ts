/**
 * Stole this from
 * https://stackoverflow.com/questions/43704904/how-to-stringify-objects-containing-es5-sets-and-maps
 * @param key
 * @param value
 */
// @ts-ignore
function replaceMapWithArray(key, value) {
  if (value instanceof Map || value instanceof Set) {
    return [...value];
    // of course you can separate cases to turn Maps into objects
  }
  return value;
}

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
export function convertTreeToObject(objectToSerialize) {
  return JSON.parse(JSON.stringify(objectToSerialize, replaceMapWithObject));
}
