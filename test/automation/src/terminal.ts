/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Code } from './code';
import { QuickAccess } from './quickaccess';

const TERMINAL_VIEW_SELECTOR = `#terminal`;
const XTERM_SELECTOR = `${TERMINAL_VIEW_SELECTOR} .terminal-wrapper`;
const XTERM_TEXTAREA = `${XTERM_SELECTOR} textarea.xterm-helper-textarea`;

export class Terminal {

	constructor(private code: Code, private quickaccess: QuickAccess) { }

	async showTerminal(): Promise<void> {
		await this.quickaccess.runCommand('workbench.action.terminal.toggleTerminal');
		await this.code.waitForActiveElement(XTERM_TEXTAREA);
		await this.code.waitForTerminalBuffer(XTERM_SELECTOR, lines => lines.some(line => line.length > 0));
	}

	async runCommand(commandText: string): Promise<void> {
		await this.code.writeInTerminal(XTERM_SELECTOR, commandText);
		// hold your horses
		await new Promise(c => setTimeout(c, 500));
		await this.code.dispatchKeybinding('enter');
	}

	async waitForTerminalText(accept: (buffer: string[]) => boolean, message?: string): Promise<void> {
		try {
			await this.code.waitForTerminalBuffer(XTERM_SELECTOR, accept);
		} catch (err: any) {
			if (message) {
				throw new Error(`${message}\n\nInner exception:\n${err.message}`);
			}
			throw err;
		}
	}
}
