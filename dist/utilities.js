"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const validUrl = __importStar(require("valid-url"));
const fetch = __importStar(require("node-fetch"));
const _ = __importStar(require("underscore"));
/* **************************** Get hold of a JSON file via its URL ********** */
// This is for testing purposes, so all kinds of checks are not done...
/**
 * Wrapper around the fetch function retrieving a JSON file.
 *
 * In real life, this should be more sophisticated, checking the media type of the resources, etc. For testing purposes the simple wrapper is enough
 * @param request essentially, the URL of the manifest file to test with
 * @returns the result of JSON processing (wrapped into a Promise)
 * @async
 */
function fetch_json(request) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            fetch.default(request)
                .then((response) => response.json())
                .then((body) => {
                resolve(body);
            });
        });
    });
}
exports.fetch_json = fetch_json;
;
/* **************************** General utilities **************************** */
/**
 * Checks if the value is a bona fide number
 * @param value
 */
function isNumber(value) {
    return _.isNumber(value);
}
exports.isNumber = isNumber;
/**
 * Checks if the value is an array
 * @param value
 */
function isArray(value) {
    return _.isArray(value);
}
exports.isArray = isArray;
/**
 * Checks if the value is a map (in infra term, ie, an object)
 * @param value
 */
function isMap(value) {
    return _.isObject(value) && !_.isArray(value) && !_.isFunction(value);
}
exports.isMap = isMap;
/**
 * Checks if the value is a string
 * @param value
 */
function isString(value) {
    return _.isString(value);
}
exports.isString = isString;
/**
 * Checks if the value is a boolean
 * @param value
 */
function isBoolean(value) {
    return _.isBoolean(value);
}
exports.isBoolean = isBoolean;
/**
 * Name tells it all: if the argument is  single value, it is encapsulated into
 * an array. Used for Localizable String, Linked Resources, etc.
 *
 * @param {any} arg - the input value or array of values
 * @returns {any[]}
 */
function toArray(arg) {
    return Array.isArray(arg) ? arg : [arg];
}
exports.toArray = toArray;
/**
 * Check an absolute URL; raise a logging message if needed, and return undefined if
 * it is not a proper URL
 *
 * @param value absolute URL
 * @param logger: logger for errors
 * @returns URL or undefined
 */
function check_url(value, logger) {
    if (validUrl.isUri(value) === undefined) {
        logger.log_validation_error(`'${value}' is an invalid URL`);
        return false;
    }
    else {
        return true;
    }
}
exports.check_url = check_url;
// eslint-disable-next-line max-len
const bcp_pattern = RegExp('^(((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+))$');
/**
 * Check the well-formedness, per BCP47, of a language tag
 *
 * @param value language tag
 * @param logger logger for errors
 * @returns the same language tag is returned
 */
function check_language_tag(value, logger) {
    if (value === null) {
        return null;
    }
    else if (isString(value) && bcp_pattern.test(value)) {
        return value;
    }
    else {
        logger.log_validation_error(`Invalid BCP47 format for language tag ${value}`, null, true);
        return undefined;
    }
}
exports.check_language_tag = check_language_tag;
/**
 * Check the well-formedness of a direction tag
 *
 * @param value direction tag
 * @param logger logger for errors
 * @returns the same direction tag is returned
 */
function check_direction_tag(value, logger) {
    if (value === null) {
        return null;
    }
    else if (isString(value) && (value === 'ltr' || value === 'rtl')) {
        return value;
    }
    else {
        logger.log_validation_error(`Invalid base direction tag (${value})`, null, true);
        return undefined;
    }
}
exports.check_direction_tag = check_direction_tag;
/**
 * (Shallow) copy of the object. It seems to be necessary to do it this way to ensure that the 'to' object
 * gets and maintains the correct Typescript type
 *
 * @param from
 * @param to
 */
function copy_object(from, to) {
    Object.getOwnPropertyNames(from).forEach((key) => to[key] = from[key]);
    // To test whether this would work with Typescript:
    // to = _.clone(from);
}
exports.copy_object = copy_object;
/* **************************** Logger **************************** */
/**
 * Simple logger class to record errors and warnings for subsequent display
 */
class Logger {
    constructor() {
        this._validation_errors = [];
        this._fatal_errors = [];
    }
    get validation_errors() { return this._validation_errors; }
    get fatal_errors() { return this._fatal_errors; }
    // constructor() {
    //     this._validation_errors = [];
    //     this._fatal_errors = [];
    // }
    /**
     * Log an error
     *
     * @param level
     * @param message - the message that should be logged, possibly, in case the condition is false
     * @param obj - an optional object that should be added to the message in JSON
     * @param required - an optional flag whether a final remark should be added on whether that is a required or recommended feature
     */
    log(target, message, obj, required) {
        let final_message = obj === null ? `${message}` : `${message} (${JSON.stringify(obj)})`;
        if (required)
            final_message = `${final_message}; [Required feature]`;
        target.push(final_message);
    }
    /**
     * Log a validation error
     *
     * @param message - the message that should be logged, possibly, in case the condition is false
     * @param obj - an optional object that should be added to the message in JSON
     * @param required - an optional flag whether a final remark should be added on whether that is a required or recommended feature
     */
    log_validation_error(message, obj = null, required = false) {
        this.log(this._validation_errors, message, obj, required);
    }
    /**
     * Log a fatal error
     *
     * @param message - the message that should be logged, possibly, in case the condition is false
     * @param obj - an optional object that should be added to the message in JSON
     * @param required - an optional flag whether a final remark should be added on whether that is a required or recommended feature
     */
    log_fatal_error(message, obj = null, required = false) {
        this.log(this._fatal_errors, message, obj, required);
    }
    /**
     * Display all the errors as one string.
     *
     * @returns {string}
     */
    fatal_errors_toString() {
        return Logger._display(this.fatal_errors, 'Fatal Errors:');
    }
    /**
     * Display all the warnings as one string.
     *
     * @returns {string}
     */
    validation_errors_toString() {
        return Logger._display(this.validation_errors, 'Validation Errors:');
    }
    /**
     * Display all the messages as one string.
     *
     * @returns {string}
     */
    toString() {
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
//# sourceMappingURL=utilities.js.map