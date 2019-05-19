# vscode-nested-tags

View your notes without being limited by your file system's hierarchy.

## Features

![](./docs/images/nested-tags-intro.gif)

Markdown files with the directive

```markdown
<!--@nested-tags:topic,here/is/a/nested/example-->
```

or yaml frontmatter with a tags property (square brackets style)

```yaml
---
title: Hello nested tags
tags: [topic, here/is/a/nested/example]
---
```

or yaml frontmatter with a tags property (unordered list style)

```yaml
---
title: Hello nested tags
tags:
    - topic
    - here/is/a/nested/example
---
```

will be visible from the file tab under a "Tag Tree" view.

## Requirements

### Operating system

This extension has only been tested on macOS.

### Code

vs code 1.30.0 is required at a minimum.

## Extension Settings

## Known Issues

Currently this extension does not allow you to do the following:

- Have multiple workspace directories
- Click on a file that is listed in the tag tree
