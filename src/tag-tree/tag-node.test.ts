import { tagNodeSort, TagNode } from "./tag-node";

describe(tagNodeSort.name, () => {
  test("Sorts in ascending order", () => {
    const tagNodeA = new TagNode(null, "a", "");
    const tagNodeB = new TagNode(null, "b", "");

    expect(tagNodeSort(tagNodeA, tagNodeB)).toEqual(-1);
    expect(tagNodeSort(tagNodeB, tagNodeA)).toEqual(1);
    expect(tagNodeSort(tagNodeA, tagNodeA)).toEqual(0);
  });
});
