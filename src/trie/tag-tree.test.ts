import { TagTree } from "./trie";

describe("Trie", () => {
  describe("addNode", () => {
    test("Single depth path", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello"], "foo.md");
      console.log(tagTree);
    });
    test("Two separate branches", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello", "world"], "foo.md");
      console.log(tagTree);
    });
    test("Two directories deep", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello/world"], "foo.md");
      console.log(tagTree);
    });

    test("No depth path", () => {});

    // TODO: (bdietz) - delete when the tree looks like this
    // A -> B -> C -> file.blah
    // would need to crawl back up the tree to make sure that
    // Those tags are not left over
  });
});
