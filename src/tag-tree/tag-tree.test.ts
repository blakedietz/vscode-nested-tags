import { TagTree } from "./tag-tree";
import { createDeepSnapshot } from "./test-helpers";

describe("TagTree", () => {
  describe("deleteFile", () => {
    test("Delete node under root", () => {
      const tagTree = new TagTree();
      const filePath = "/Users/test/foo.md";
      tagTree.addFile(filePath, ["hello"], "foo.md");
      tagTree.deleteFile(filePath);

      expect(createDeepSnapshot(tagTree)).toMatchSnapshot();
    });
    test("Delete file under shared tag", () => {
      const tagTree = new TagTree();
      const filePath = "/Users/test/foo.md";
      tagTree.addFile(filePath, ["hello"], "foo.md");
      tagTree.addFile("/Users/test/bar.md", ["hello"], "bar.md");
      tagTree.deleteFile(filePath);

      expect(createDeepSnapshot(tagTree)).toMatchSnapshot();
    });

    test("Delete file under shared tag with empty node", () => {
      const tagTree = new TagTree();
      const filePath = "/Users/test/foo.md";
      tagTree.addFile(filePath, ["hello/world/asuh"], "foo.md");
      tagTree.addFile("/Users/test/bar.md", ["hello"], "bar.md");
      tagTree.deleteFile(filePath);
      expect(createDeepSnapshot(tagTree)).toMatchSnapshot();
    });
  });
  describe("getTagsForFile", () => {
    test("Retrieves all tags for a file", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello", "world"], "foo.md");
      const tags = tagTree.getTagsForFile("foo.md");
      expect([...tags]).toEqual(["hello", "world"]);
      expect(createDeepSnapshot(tagTree)).toMatchSnapshot();
    });
  });

  describe("addNode", () => {
    test("Single depth path", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello"], "foo.md");

      expect(createDeepSnapshot(tagTree)).toMatchSnapshot();
    });
    test("Two separate branches", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello", "world"], "foo.md");

      expect(createDeepSnapshot(tagTree)).toMatchSnapshot();
    });
    test("Two directories deep", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello/world"], "foo.md");
      expect(createDeepSnapshot(tagTree)).toMatchSnapshot();
    });
    test("Two files under the same tag", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello"], "foo.md");
      tagTree.addFile("bar.md", ["hello"], "foo.md");

      expect(createDeepSnapshot(tagTree)).toMatchSnapshot();
    });
  });
});
