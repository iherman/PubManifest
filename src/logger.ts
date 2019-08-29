/**
 * Simple logger class to record errors and warnings for subsequent display
 */

export enum LogLevel {
    warning,
    error
}

export class Logger {
    private _warnings: string[];
    private _errors: string[];

    constructor() {
        this._warnings = [];
        this._errors = [];
    }

    /**
     * Assertion that should lead to a log the message if false.
     *
     * @param {boolean} condition - the condition that decides whether the message should be logged
     * @param {string} message - the message that should be logged, possibly, in case the condition is false
     * @param {Symbol} level - either LogLevel.warning or LogLevel.error
     * @returns {boolean}
     */
    assert(condition: boolean, message: string, level: LogLevel) : boolean {
        if (!condition) {
            switch (level) {
                case LogLevel.error:
                    this._errors.push(message);
                    break;
                case LogLevel.warning:
                    this._warnings.push(message);
                    break;
                default:
                    break;
            }
        }
        return condition;
    }

    get warnings() { return this._warnings; }

    get errors() { return this._errors; }

    /**
     * Display all the errors as one string.
     *
     * @returns {string}
     */
    errors_toString() : string {
        return Logger._display(this.errors, 'Errors:');
    }

    /**
     * Display all the warnings as one string.
     *
     * @returns {string}
     */
    warnings_toString() : string {
        return Logger._display(this.warnings, 'Warnings:');
    }

    /**
     * Display all the messages as one string.
     *
     * @returns {string}
     */
    toString() : string {
        return `${this.warnings_toString()}\n${this.errors_toString()}`;
    }

    /**
     * Generate a string for a category of messages.
     *
     * @static
     * @param {string[]} messages - set of messages to display.
     * @param {string} start - a text preceding the previous.
     * @returns {string}
     */
    private static _display(messages: string[], start: string) : string {
        let retval = start;
        if (messages.length === 0) {
            retval += ' none';
        } else {
            messages.forEach((element: string) => {
                retval += `\n    - ${element}`;
            });
        }
        return retval;
    }
}
