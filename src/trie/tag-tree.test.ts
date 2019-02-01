import { TagTree } from "./tag-tree";
import { convertTreeToObject } from "./trie-test-helpers";

describe("Trie", () => {
  describe("addNode", () => {
    test("Single depth path", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello"], "foo.md");
      console.log(convertTreeToObject(tagTree));
      console.log(convertTreeToObject(tagTree).root.tags.hello.files["foo.md"]);
    });
    test("Two separate branches", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello", "world"], "foo.md");
      console.log(convertTreeToObject(tagTree).root.tags.hello.files["foo.md"]);
      console.log(convertTreeToObject(tagTree).root.tags.world.files["foo.md"]);
    });
    test("Two directories deep", () => {
      const tagTree = new TagTree();
      tagTree.addFile("foo.md", ["hello/world"], "foo.md");
      console.log(
        convertTreeToObject(tagTree).root.tags.hello.tags.world.files["foo.md"]
      );
    });

    // test("No depth path", () => {});
    // TODO: (bdietz) - delete when the tree looks like this
    // A -> B -> C -> file.blah
    // would need to crawl back up the tree to make sure that
    // Those tags are not left over
  });
});
