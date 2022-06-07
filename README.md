# markdown-chess README

Markdown-chess is a VSCode extension for markdown files for chess.

It extends markdown with the chess functionality you've always wanted!

## Features

### The Basic Board

Using **chess** code blocks you can describe a chess position in a very similar way to Wikipedia's {{Chess diagram}} format

Chess pieces are notated by their letter below followed by `l` for light/white or `d` for dark/black:

* `k` - king
* `q` - queen
* `r` - rook
* `b` - bishop
* `n` - night
* `p` - pawn

So the white king would be notated by `kl`.

![Board Generation](images/Demo-board1.PNG)

You can add highlights to squares using symbols:

* `*` Highlight Square (blue in default theme)
* `!` Highlight Attack (red in default theme)

You can add hints using these symbols:

* `.` hint move option
* `o` or `.[piece]` hint attack option

Combining these you can start to build a board with clear annotation both in markdown and when converted to svg format for preview:

![Board Generation](images/Demo-board2.PNG)

<!--## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something
-->
## Known Issues

## Release Notes

<!--### 1.0.0

Initial release of markdown-chess *TBD*...
-->

<!-------------------------------------------------------------------------------------------------------------
## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
-->
