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
	var boardGrid: [string[]] = parseBoardGrid(source);
	
	return (
	` style="text-align: center; margin: auto; display: block;">` +
	`<div style="width: `+boardSize+`; margin:0 auto; border: 1px solid #666564; background: #312e2b; float:` +boardAlign+ `; clear: both;">` +
	`<h3 style="text-transform:capitalize">`+ boardTitle +`</h3>` +
	`<svg` +
	`   width = "100%"` +
	`   height = "100%"`+
	`   viewBox = "0 0 1000 1000"` +
	`>` +
	generateBoard(boardGrid) +	
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


function parseBoardGrid (input: string)
{
	var regexExpression = new RegExp('[|][^|\r\n]{0,5}((\r?\n)?[|][^|\r\n]{0,5})+');
	var regexResult = input.match(regexExpression);
	console.log(regexResult);
	var boardLines:string[] = [];
	var boardGrid:[string[]]= [[""]];
	if ((regexResult !== null))
	{
		boardLines = regexResult[0].split(/\r?\n/)||[];
		boardLines.forEach((name, index) => boardLines[index] = (boardLines[index].slice(1)||""));
		boardLines.forEach((name, index) => boardGrid[index] = boardLines[index].split("|"));
	}
	//Force all lines to equal width
	var boardWidth: number = boardGrid.reduce((t,e) => Math.max(t, e.length), 0);
	boardGrid.forEach((name, index) => boardGrid[index] = boardGrid[index].concat(Array(boardWidth - boardGrid[index].length).fill("__")));
	
	return boardGrid;
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

function generateBoard(boardGrid: [string[]])
{
	var boardWidth: number = boardGrid[0].length;
	var boardHeight: number = boardGrid.length;
	var gridSize = (1000)/(boardWidth+1);
	var returnHtml: string =
	`<rect `+
		`x="` + (gridSize/2).toString() + `" y="` + (gridSize/2).toString() + `" `+
		`width="` + (gridSize*boardWidth-1).toString() + `" `+
		`height="` + (gridSize*boardHeight-1).toString() + `" `+
		`fill="OliveDrab"`+
	`/> `;
	returnHtml += definedChessMaterial(gridSize);

	returnHtml += `<path d="`;
	var offsetType = (boardWidth % 2 === boardHeight % 2);
	for (var h = 0; h < boardHeight ;h++)
	{
		returnHtml += `M`;
		if ((h % 2 === 0)  === offsetType)
		{
			returnHtml += (gridSize*0.5).toString() +`,`;
			returnHtml += (gridSize*(h+1)).toString() +` `;
			returnHtml += `h`+(gridSize*(boardWidth)).toString() + ` `; 
		} else {
			returnHtml += (gridSize*1.5).toString() +`,`;
			returnHtml += (gridSize*(h+1)).toString() +` `;
			returnHtml += `h`+(gridSize*(boardWidth-1)).toString() + ` `; 
		}
	}
	returnHtml += `" ` +
	`stroke="Bisque" ` +
	`stroke-dasharray="` + gridSize + `" ` +
	`stroke-width="` + gridSize + `" ` +
	`/>`;
	for (var h = 0; h < boardHeight; h++)
	{
		for (var w = 0; w < boardWidth; w++)
		{
			var piece: string = parsePiece(boardGrid[h][w], gridSize);
			if (piece != "")
			{
				returnHtml +=`<use
				x="`+ (w*gridSize + gridSize/2).toString() +`" 
				y="`+ (h*gridSize + gridSize/2).toString() +`" 
				xlink:href="#` + piece +`"/>`;
			}
		}
	}
	return(returnHtml);
}

function parsePiece(pieceDiagramShort: string, gridSize: number)
{
	var svgPiece = "";
	switch(pieceDiagramShort.toLowerCase())
	{
		case("kl"):
			svgPiece = "chesswhiteking";
		break;
		case("ql"):
			svgPiece = "chesswhitequeen";
		break;
		case("rl"):
			svgPiece = "chesswhiterook";
		break;
		case("bl"):
			svgPiece = "chesswhitebishop";
		break;
		case("nl"):
			svgPiece = "chesswhiteknight";
		break;
		case("pl"):
			svgPiece = "chesswhitepawn";
		break;

		case("kd"):
			svgPiece = "chessblackking";
		break;
		case("qd"):
			svgPiece = "chessblackqueen";
		break;
		case("rd"):
			svgPiece = "chessblackrook";
		break;
		case("bd"):
			svgPiece = "chessblackbishop";
		break;
		case("nd"):
			svgPiece = "chessblackknight";
		break;
		case("pd"):
			svgPiece = "chessblackpawn";
		break;
	}
	if (svgPiece != "")
	{
		svgPiece += "_" + gridSize;
	}
	return (svgPiece);
}

function definedChessMaterial(gridSize : number)
{
	const baseSize: number = 45;
	var scale:number = gridSize/baseSize;
	var chessSvgSymbols: string = "";
	
		//White Pieces
		chessSvgSymbols += `<symbol id="chesswhiteking_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;">
			<path d="M 22.5,11.63 L 22.5,6" style="fill:none; stroke:#000000; stroke-linejoin:miter;"/>
			<path d="M 20,8 L 25,8" style="fill:none; stroke:#000000; stroke-linejoin:miter;"/>
			<path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" style="fill:#ffffff; stroke:#000000; stroke-linecap:butt; stroke-linejoin:miter;"/>
			<path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" style="fill:#ffffff; stroke:#000000;"/>
			<path d="M 12.5,30 C 18,27 27,27 32.5,30" style="fill:none; stroke:#000000;"/>
			<path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" style="fill:none; stroke:#000000;"/>
			<path d="M 12.5,37 C 18,34 27,34 32.5,37" style="fill:none; stroke:#000000;"/>
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chesswhitequeen_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="fill:#ffffff;stroke:#000000;stroke-width:1.5;stroke-linejoin:round">
			<path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z"/>
			<path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"/>
			<path d="M 11.5,30 C 15,29 30,29 33.5,30" style="fill:none"/>
			<path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" style="fill:none"/>
			<circle cx="6" cy="12" r="2" />
			<circle cx="14" cy="9" r="2" />
			<circle cx="22.5" cy="8" r="2" />
			<circle cx="31" cy="9" r="2" />
			<circle cx="39" cy="12" r="2" />
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chesswhiterook_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="opacity:1; fill:#ffffff; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;" transform="translate(0,0.3)">
		<path
			d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z "
			style="stroke-linecap:butt;" />
		<path
			d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z "
			style="stroke-linecap:butt;" />
		<path
			d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"
			style="stroke-linecap:butt;" />
		<path
			d="M 34,14 L 31,17 L 14,17 L 11,14" />
		<path
			d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"
			style="stroke-linecap:butt; stroke-linejoin:miter;" />
		<path
			d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" />
		<path
			d="M 11,14 L 34,14"
			style="fill:none; stroke:#000000; stroke-linejoin:miter;" />
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chesswhiteking_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;">
			<path d="M 22.5,11.63 L 22.5,6" style="fill:none; stroke:#000000; stroke-linejoin:miter;"/>
			<path d="M 20,8 L 25,8" style="fill:none; stroke:#000000; stroke-linejoin:miter;"/>
			<path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" style="fill:#ffffff; stroke:#000000; stroke-linecap:butt; stroke-linejoin:miter;"/>
			<path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" style="fill:#ffffff; stroke:#000000;"/>
			<path d="M 12.5,30 C 18,27 27,27 32.5,30" style="fill:none; stroke:#000000;"/>
			<path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" style="fill:none; stroke:#000000;"/>
			<path d="M 12.5,37 C 18,34 27,34 32.5,37" style="fill:none; stroke:#000000;"/>
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chesswhitebishop_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="opacity:1; fill:none; fill-rule:evenodd; fill-opacity:1; stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;" transform="translate(0,0.6)">>
			<g style="fill:#ffffff; stroke:#000000; stroke-linecap:butt;">
				<path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z"/>
				<path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z"/>
				<path d="M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z"/>
			</g>
		<path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" style="fill:none; stroke:#000000; stroke-linejoin:miter;"/>
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chesswhiteknight_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="opacity:1; fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;" transform="translate(0,0.3)">
		<path
			d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
			style="fill:#ffffff; stroke:#000000;" />
		<path
			d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"
			style="fill:#ffffff; stroke:#000000;" />
		<path
			d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z"
			style="fill:#000000; stroke:#000000;" />
		<path
			d="M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z"
			transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
			style="fill:#000000; stroke:#000000;" />
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chesswhitepawn_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)">
		<path 
			d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 H 34 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" 
			style="opacity:1; 
			fill:#ffffff; fill-opacity:1; fill-rule:nonzero; 
			stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:miter; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;"/>
		</g></symbol>`;
		
		//Black Pieces
		chessSvgSymbols += `<symbol id="chessblackking_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;">
			<path d="M 22.5,11.63 L 22.5,6" style="fill:none; stroke:#000000; stroke-linejoin:miter;" id="path6570"/>
			<path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" style="fill:#000000;fill-opacity:1; stroke-linecap:butt; stroke-linejoin:miter;"/>
			<path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" style="fill:#000000; stroke:#000000;"/>
			<path d="M 20,8 L 25,8" style="fill:none; stroke:#000000; stroke-linejoin:miter;"/>
			<path d="M 32,29.5 C 32,29.5 40.5,25.5 38.03,19.85 C 34.15,14 25,18 22.5,24.5 L 22.5,26.6 L 22.5,24.5 C 20,18 10.85,14 6.97,19.85 C 4.5,25.5 13,29.5 13,29.5" style="fill:none; stroke:#ffffff;"/>
			<path d="M 12.5,30 C 18,27 27,27 32.5,30 M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5 M 12.5,37 C 18,34 27,34 32.5,37" style="fill:none; stroke:#ffffff;"/>
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chessblackqueen_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="fill:#000000;stroke:#000000;stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round">
			<path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z"
			style="stroke-linecap:butt;fill:#000000" />
			<path d="m 9,26 c 0,2 1.5,2 2.5,4 1,1.5 1,1 0.5,3.5 -1.5,1 -1,2.5 -1,2.5 -1.5,1.5 0,2.5 0,2.5 6.5,1 16.5,1 23,0 0,0 1.5,-1 0,-2.5 0,0 0.5,-1.5 -1,-2.5 -0.5,-2.5 -0.5,-2 0.5,-3.5 1,-2 2.5,-2 2.5,-4 -8.5,-1.5 -18.5,-1.5 -27,0 z" />
			<path d="M 11.5,30 C 15,29 30,29 33.5,30" />
			<path d="m 12,33.5 c 6,-1 15,-1 21,0" />
			<circle cx="6" cy="12" r="2" />
			<circle cx="14" cy="9" r="2" />
			<circle cx="22.5" cy="8" r="2" />
			<circle cx="31" cy="9" r="2" />
			<circle cx="39" cy="12" r="2" />
			<path d="M 11,38.5 A 35,35 1 0 0 34,38.5"
			style="fill:none; stroke:#000000;stroke-linecap:butt;" />
			<g style="fill:none; stroke:#ffffff;">
				<path d="M 11,29 A 35,35 1 0 1 34,29" />
				<path d="M 12.5,31.5 L 32.5,31.5" />
				<path d="M 11.5,34.5 A 35,35 1 0 0 33.5,34.5" />
				<path d="M 10.5,37.5 A 35,35 1 0 0 34.5,37.5" />
			</g>
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chessblackrook_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="opacity:1; fill:#000000; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;" transform="translate(0,0.3)">
			<path
				d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z "
				style="stroke-linecap:butt;" />
			<path
				d="M 12.5,32 L 14,29.5 L 31,29.5 L 32.5,32 L 12.5,32 z "
				style="stroke-linecap:butt;" />
			<path
				d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z "
				style="stroke-linecap:butt;" />
			<path
				d="M 14,29.5 L 14,16.5 L 31,16.5 L 31,29.5 L 14,29.5 z "
				style="stroke-linecap:butt;stroke-linejoin:miter;" />
			<path
				d="M 14,16.5 L 11,14 L 34,14 L 31,16.5 L 14,16.5 z "
				style="stroke-linecap:butt;" />
			<path
				d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z "
				style="stroke-linecap:butt;" />
			<path
				d="M 12,35.5 L 33,35.5 L 33,35.5"
				style="fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;" />
			<path
				d="M 13,31.5 L 32,31.5"
				style="fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;" />
			<path
				d="M 14,29.5 L 31,29.5"
				style="fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;" />
			<path
				d="M 14,16.5 L 31,16.5"
				style="fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;" />
			<path
				d="M 11,14 L 34,14"
				style="fill:none; stroke:#ffffff; stroke-width:1; stroke-linejoin:miter;" />
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chessblackking_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;">
			<path d="M 22.5,11.63 L 22.5,6" style="fill:none; stroke:#000000; stroke-linejoin:miter;"/>
			<path d="M 20,8 L 25,8" style="fill:none; stroke:#000000; stroke-linejoin:miter;"/>
			<path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" style="fill:#ffffff; stroke:#000000; stroke-linecap:butt; stroke-linejoin:miter;"/>
			<path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" style="fill:#ffffff; stroke:#000000;"/>
			<path d="M 12.5,30 C 18,27 27,27 32.5,30" style="fill:none; stroke:#000000;"/>
			<path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" style="fill:none; stroke:#000000;"/>
			<path d="M 12.5,37 C 18,34 27,34 32.5,37" style="fill:none; stroke:#000000;"/>
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chessblackbishop_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="opacity:1; fill:none; fill-rule:evenodd; fill-opacity:1; stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;" transform="translate(0,0.6)">
			<g style="fill:#000000; stroke:#000000; stroke-linecap:butt;">
				<path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z"/>
				<path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z"/>
				<path d="M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z"/>
			</g>
			<path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" style="fill:none; stroke:#ffffff; stroke-linejoin:miter;"/>
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chessblackknight_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)" style="opacity:1; fill:none; fill-opacity:1; fill-rule:evenodd; stroke:#000000; stroke-width:1.5; stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;" transform="translate(0,0.3)">
			<path
				d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
				style="fill:#000000; stroke:#000000;" />
			<path
				d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"
				style="fill:#000000; stroke:#000000;" />
			<path
				d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z"
				style="fill:#ffffff; stroke:#ffffff;" />
			<path
				d="M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z"
				transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
				style="fill:#ffffff; stroke:#ffffff;" />
			<path
				d="M 24.55,10.4 L 24.1,11.85 L 24.6,12 C 27.75,13 30.25,14.49 32.5,18.75 C 34.75,23.01 35.75,29.06 35.25,39 L 35.2,39.5 L 37.45,39.5 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 C 31.88,13.17 28.46,11.02 25.06,10.5 L 24.55,10.4 z "
				style="fill:#ffffff; stroke:none;" />
		</g></symbol>`;
		chessSvgSymbols += `<symbol id="chessblackpawn_`+gridSize+`" width="`+gridSize+`" height ="`+gridSize+`">
		<g transform="scale(`+scale+`)">
		<path 
			d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 H 34 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" 
			style="opacity:1; 
			fill:#000000; fill-opacity:1; fill-rule:nonzero; 
			stroke:#000000; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:miter; stroke-miterlimit:4; stroke-dasharray:none; stroke-opacity:1;"/>
		</g></symbol>`;
		return(chessSvgSymbols);
}

// this method is called when your extension is deactivated
export function deactivate() {}
