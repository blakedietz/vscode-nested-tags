import { fileNodeSort, FileNode } from "./file-node";

describe(fileNodeSort.name, () => {
  test("Sorts in ascending order", () => {
    const fileNodeA = new FileNode("a", "a", "a", [], "a");
    const fileNodeB = new FileNode("b", "b", "b", [], "b");

    expect(fileNodeSort(fileNodeA, fileNodeB)).toEqual(-1);
    expect(fileNodeSort(fileNodeB, fileNodeA)).toEqual(1);
    expect(fileNodeSort(fileNodeA, fileNodeA)).toEqual(0);
  });
});
