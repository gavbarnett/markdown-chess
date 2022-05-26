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
						return `<div class="${pluginKeyword}"${process(src)}`;
					} else {
						return '</div>';
					}
				}
			});

			const highlight = md.options.highlight;
			md.options.highlight = (code: any, lang: string) => {
				if (lang && lang.match(/\bchess\b/i)) {
					return `<pre style="all:unset;"><div class="${pluginKeyword}"${process(code)}</div></pre>`;
				}
				return highlight(code, lang);
			};
			return md;
		}
	};
}

function process (source: string)
{
	var boardTheme: string = parseBoardTheme(source);
	var boardAlign: string = parseBoardAlign(source);
	var boardSize: string = parseBoardSize(source);
	var boardNumbers: boolean = parseBoardNumbers(source);
	var boardLetters: boolean = parseBoardLetters(source);
	var boardTitle: string = parseBoardTitle(source);
	var boardNotes: string = parseBoardNotes(source);
	var boardMoves: string = parseBoardMoves(source);
	return (
	` style="text-align: center; margin: auto; display: block;">` +
	`<div style="width: `+boardSize+`; margin:0 auto; border: 1px solid #666564; background: #312e2b; float:` +boardAlign+ `; clear: both;">` +
	`<h3 style="text-transform:capitalize">`+ boardTitle +`</h3>` +
	`<svg` +
	`   width = "100%"` +
	`   height = "100%"`+
	`   viewBox = "0 0 1000 1000"` +
	`>` +
	generateBoard("") +	
	`</svg>`+
	`<p>`+boardMoves+`</p>` +
	`<p>`+boardNotes+`</p>`+
	`</div>`
	);
}

function parseBoardLetters (input: string)
{
	return parseSettings(input, "letters") === 'true';
}

function parseBoardNumbers (input: string)
{
	return parseSettings(input, "numbers") === 'true';
}

function parseBoardTheme (input: string)
{
	var stringVar: string = parseSettings (input, "theme");
	var returnVar = (stringVar.match(
		/^[/s]*(base|dark|light)$/
	) ?? ["base"])[0];
	return returnVar;
}

function parseBoardAlign (input: string)
{
	var stringVar: string = parseSettings (input, "align");
	var returnVar = (stringVar.match(
		/^[/s]*(left|right|none)$/
	) ?? ["none"])[0];
	return returnVar;
}

function parseBoardSize (input: string)
{
	var returnVar: string = "50%";
	var stringVar: string = parseSettings (input, "size");
	var numericVar: number = 50;
	var unitsVar :string = "%";
	if (stringVar !== null)
	{
		numericVar = Number((stringVar.match(/^[\s]*([\d]+)/g) ?? "50"));
		unitsVar = (stringVar.match(
			/(cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)$/
		) ?? [""])[0];
	}
	if (!(isNaN((numericVar))) && unitsVar !== "")
	{
		if (unitsVar !== null)
		{
			returnVar = numericVar.toString() + unitsVar;
		}
	}
	return returnVar;
}

function parseBoardMoves (input: string)
{
	var stringVar: string = parseSettings (input, "moves") ?? "";
	var returnVar = stringVar; //add checking later
	return returnVar;
}

function parseBoardTitle (input: string)
{
	var stringVar: string = parseSettings (input, "title") ?? "";
	var returnVar = stringVar; //add checking later
	return returnVar;
}

function parseBoardNotes (input: string)
{
	var stringVar: string = parseSettings (input, "notes") ?? "";
	var returnVar = stringVar; //add checking later
	return returnVar;
}

function parseSettings (input: string, varName: string)
{
	var returnVar: string = "";
	var regexExpression = new RegExp(varName.toLowerCase() + '[\\s]+(?<setting>.*)');
	var regexResult = input.toLowerCase().match(regexExpression);
	if ((regexResult !== null) && (regexResult.groups?.setting))
	{
		(returnVar = regexResult.groups?.setting);
	}
	return returnVar;
}

const generateBoard = (/** @type {string} */ source: string) =>
	source =
	`<rect x="100" y="50" width="800" height="800" fill="OliveDrab" />
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
	/>`;
	
// this method is called when your extension is deactivated
export function deactivate() {}
