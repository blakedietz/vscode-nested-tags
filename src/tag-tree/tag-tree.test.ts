import { TagTree } from "./tag-tree";
import { convertTreeToObject, walkFromPath } from "./test-helpers";

describe("TagTree", () => {
  describe("getTagsForFile", () => {
    test('Retrieves all tags for a file', () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello", "world"], "foo.md");
      const tags = tagTree.getTagsForFile("foo.md");
      expect([...tags]).toEqual(["hello", "world"]);
    });
  });

  describe("addNode", () => {
    test("Single depth path", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello"], "foo.md");

      const file = walkFromPath("hello/foo.md", tagTree);
      console.log(file);
    });
    test("Two separate branches", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello", "world"], "foo.md");
    });
    test("Two directories deep", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello/world"], "foo.md");
      const file = walkFromPath("hello/world/foo.md", tagTree);
      console.log(file);
    });
    test("Two files under the same tag", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello"], "foo.md");
      tagTree.addFile("bar.md", ["hello"], "foo.md");
      const fooFile = walkFromPath("hello/foo.md", tagTree);
      const barFile = walkFromPath("hello/foo.md", tagTree);
      console.log(convertTreeToObject(tagTree));
      console.log(fooFile);
      console.log(barFile);
    });

    // test("No depth path", () => {});
    // TODO: (bdietz) - delete when the tree looks like this
    // A -> B -> C -> file.blah
    // would need to crawl back up the tree to make sure that
    // Those tags are not left over
  });
});
