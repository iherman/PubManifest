"use strict";
/* **************************** General utilities **************************** */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Name tells it all: if the argument is  single value, it is encapsulated into
 * an array. Used for Localizable String, Linked Resources, etc.
 *
 * @param {any} arg - the input value or array of values
 * @returns {any[]}
 */
exports.toArray = (arg) => Array.isArray(arg) ? arg : [arg];
/**
 * Simple logger class to record errors and warnings for subsequent display
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["warning"] = 0] = "warning";
    LogLevel[LogLevel["error"] = 1] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class Logger {
    constructor() {
        this._warnings = [];
        this._errors = [];
    }
    /**
     * Assertion that should lead to a log the message if false.
     *
     * @param {string} message - the message that should be logged, possibly, in case the condition is false
     * @param {Symbol} level - either LogLevel.warning or LogLevel.error
     * @returns {boolean}
     */
    log(message, level) {
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
    get warnings() { return this._warnings; }
    get errors() { return this._errors; }
    /**
     * Display all the errors as one string.
     *
     * @returns {string}
     */
    errors_toString() {
        return Logger._display(this.errors, 'Errors:');
    }
    /**
     * Display all the warnings as one string.
     *
     * @returns {string}
     */
    warnings_toString() {
        return Logger._display(this.warnings, 'Warnings:');
    }
    /**
     * Display all the messages as one string.
     *
     * @returns {string}
     */
    toString() {
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
    static _display(messages, start) {
        let retval = start;
        if (messages.length === 0) {
            retval += ' none';
        }
        else {
            messages.forEach((element) => {
                retval += `\n    - ${element}`;
            });
        }
        return retval;
    }
}
exports.Logger = Logger;
