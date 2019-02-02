import { TagTree } from "./tag-tree";
import { walkFromPath } from "./test-helpers";

describe("Trie", () => {
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

    // test("No depth path", () => {});
    // TODO: (bdietz) - delete when the tree looks like this
    // A -> B -> C -> file.blah
    // would need to crawl back up the tree to make sure that
    // Those tags are not left over
  });
});
