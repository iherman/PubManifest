import * as validUrl from 'valid-url';
import * as fetch from 'node-fetch';
import * as _ from 'underscore';

// const fetch = require('node-fetch');

/* **************************** Get hold of a JSON file via its URL ********** */
// This is for testing purposes, so all kinds of checks are not done...
//

export  async function fetch_json(request: fetch.RequestInfo): Promise<any> {
    return new Promise(resolve => {
      fetch.default(request)
        .then((response: fetch.Response) => response.json())
        .then((body: fetch.Body) => {
          resolve(body);
        });
    });
};

/* **************************** General utilities **************************** */


export function isNumber(value :any ): boolean
{
    return _.isNumber(value);
}

export function isArray(value: any): boolean
{
    return _.isArray(value);
}

export function isMap(value: any): boolean
{
    return _.isObject(value) && !_.isArray(value);
}

export function isString(value: any): boolean
{
    return _.isString(value);
}

export function isBoolean(value: any): boolean
{
    return _.isBoolean(value);
}

/**
 * Name tells it all: if the argument is  single value, it is encapsulated into
 * an array. Used for Localizable String, Linked Resources, etc.
 *
 * @param {any} arg - the input value or array of values
 * @returns {any[]}
 */
export function toArray(arg: any): any[] {
    return Array.isArray(arg) ? arg : [arg];
}

/**
 * Check an absolute URL; raise a logging message if needed, and return undefined if
 * it is not a proper URL
 *
 * @param value absolute URL
 * @param logger: logger for errors
 * @returns URL or undefined
 */
export function check_url(value: string, logger: Logger): boolean {
    if (validUrl.isWebUri(value) === undefined) {
        logger.log(`'${value}' is an invalid Web URL`, LogLevel.ValidationError);
        return false;
    } else {
        return true;
    }
}

// eslint-disable-next-line max-len
const bcp_pattern = RegExp('^(((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+))$');
/**
 * Check the well-formedness, per BCP47, of a language tag
 *
 * @param value language tag
 * @param logger logger for errors
 * @returns the same language tag is returned
 */
export function check_language_tag(value: string, logger: Logger): string {
    if (value === null) {
        return null;
    } else if (isString(value) && bcp_pattern.test(value)) {
        return value;
    } else {
        return undefined;
    }
}

/**
 * Check the well-formedness of a direction tag
 *
 * @param value direction tag
 * @param logger logger for errors
 * @returns the same direction tag is returned
 */
export function check_direction_tag(value: string, logger: Logger): string {
    if (value === null) {
        return null;
    } else if (isString(value) && (value === 'ltr' || value === 'rtl')) {
        return value;
    } else {
        return undefined;
    }
}

/* **************************** Logger **************************** */

/**
 * Simple logger class to record errors and warnings for subsequent display
 */
export enum LogLevel {
    ValidationError,
    FatalError
}

export class Logger {
    private _validation_errors: string[];
    private _fatal_errors: string[];

    constructor() {
        this._validation_errors = [];
        this._fatal_errors = [];
    }

    /**
     * Assertion that should lead to a log the message if false.
     *
     * @param {string} message - the message that should be logged, possibly, in case the condition is false
     * @param {Symbol} level - either LogLevel.warning or LogLevel.error
     * @returns {boolean}
     */
    log(message: string, level: LogLevel) : void {
        switch (level) {
            case LogLevel.FatalError:
                this._fatal_errors.push(message);
                break;
            case LogLevel.ValidationError:
                this._validation_errors.push(message);
                break;
            default:
                break;
        }
    }

    get validation_errors(): string[] { return this._validation_errors; }

    get fatal_errors() : string[] { return this._fatal_errors; }

    /**
     * Display all the errors as one string.
     *
     * @returns {string}
     */
    fatal_errors_toString() : string {
        return Logger._display(this.fatal_errors, 'Fatal Errors:');
    }

    /**
     * Display all the warnings as one string.
     *
     * @returns {string}
     */
    validation_errors_toString() : string {
        return Logger._display(this.validation_errors, 'Validation Errors:');
    }

    /**
     * Display all the messages as one string.
     *
     * @returns {string}
     */
    toString() : string {
        return `${this.validation_errors_toString()}\n${this.fatal_errors_toString()}`;
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
