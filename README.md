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

## Extension Settings

### Configurations

| Name                                     | Type          | Description                                   |
| ---------------------------------------- | ------------- | --------------------------------------------- |
| `vscode-nested-tags.additionalFileTypes` | Array<string> | Additional file types to introspect for tags. |

### Custom file extensions

You can define custom file extensions in your `settings.json`. These file extensions allow the plugin to look at more than just markdown files for the tag system.

Here's an example `settings.json` file.

```json
{
  "vscode-nested-tags.additionalFileTypes": ["tex", "html"]
}
```

Now all `.tex` and `.html` files till be watched alongside `.md` files.

## Requirements

### Operating system

This extension has only been tested on macOS.

### Code

vs code 1.30.0 is required at a minimum.

## Support

Help support the project by sending some BTC to the following crypto wallets

### BTC

39DUAVda1zkiszw4KrPSHwdmT4pNDUrWfE

### ETH

0x30D2Cba30E62DfD64E945F821cF0d27B437AdBa5
