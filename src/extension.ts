// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as mdItContainer from 'markdown-it-container';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const pluginKeyword = 'chess';
	const tokenTypeInline = 'inline';
	const ttContainerOpen = 'container_' + pluginKeyword + '_open';
	const ttContainerClose = 'container_' + pluginKeyword + '_close';
	const empty: never[] = [];

	return {
		extendMarkdownIt(md : any): any {
			md.use(mdItContainer, pluginKeyword, {
				anyClass: true,
				validate: (info: string) => {
					return info.trim() === pluginKeyword;
				},

				render: (tokens: string | any[], idx: number) => {
					const token = tokens[idx];

					var src = '';
					if (token.type === ttContainerOpen) {
						for (var i = idx + 1; i < tokens.length; i++) {
							const value = tokens[i];
							if (value === undefined || value.type === ttContainerClose) {
								break;
							}
							src += value.content;
							if (value.block && value.nesting <= 0) {
								src += '\n';
							}
							// Clear these out so markdown-it doesn't try to render them
							value.tag = '';
							value.type = tokenTypeInline;
							// Code can be triggered multiple times, even if tokens are not updated (eg. on editor losing and regaining focus). Content must be preserved, so src can be realculated in such instances.
							//value.content = ''; 
							value.children = empty;
						}
					}

					if (token.nesting === 1) {
						return `<div class="${pluginKeyword}">${process(src)}`;
					} else {
						return '</div>';
					}
				}
			});

			const highlight = md.options.highlight;
			md.options.highlight = (code: any, lang: string) => {
				if (lang && lang.match(/\bchess\b/i)) {
					return `<pre style="all:unset;"><div class="${pluginKeyword}" style="text-align:center;">${process(code)}</div></pre>`;
				}
				return highlight(code, lang);
			};
			return md;
		}
	};
}

const process = (/** @type {string} */source: string) =>
//    source;
source = 
`<svg width="50%" height="50%" viewBox="0 0 1000 1000">
	<rect x="100" y="50" width="800" height="800" fill="OliveDrab" />
	<path d="
		M100,100
		h700
		M200,200
		h700
		M100,300
		h700
		M200,400
		h700
		M100,500
		h700
		M200,600
		h700
		M100,700
		h700
		M200,800
		h700" 
		stroke="Bisque"
		stroke-dasharray="100"
		stroke-width="100"
	/>
</svg>`;


// this method is called when your extension is deactivated
export function deactivate() {}
