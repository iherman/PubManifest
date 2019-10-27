"use strict";
/**
 * Various utilities
 */
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
const manifest_classes_1 = require("./manifest_classes");
const fetch = __importStar(require("node-fetch"));
const _ = __importStar(require("underscore"));
const urlHandler = __importStar(require("url"));
/* **************************** Get hold of a JSON file via its URL ********** */
// This is for testing purposes, so all kinds of checks are not done...
/**
 * Wrapper around the fetch function retrieving a JSON file.
 *
 * In real life, this should be more sophisticated, checking the media type of the resources, security issues, etc. For testing purposes the simple wrapper is enough
 *
 * @param request essentially, the URL of the manifest file to test with
 * @returns the result of JSON processing, i.e., an object (wrapped into a Promise)
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
 * Name tells it all: if the argument is  single value, it is encapsulated into
 * an array. Used for Localizable String, Linked Resources, etc.
 *
 * @param arg - the input value or array of values
 */
function toArray(arg) {
    return Array.isArray(arg) ? arg : [arg];
}
exports.toArray = toArray;
// eslint-disable-next-line max-len
const bcp_pattern = RegExp('^(((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+))$');
/**
 * Check the well-formedness, per BCP47, of a language tag
 *
 * @param value language tag
 * @param logger logger for errors
 * @returns the same language tag is returned, if valid, `undefined` otherwise. If the input value is `null`, it is returned unchanged.
 */
function check_language_tag(value, logger) {
    if (value === null) {
        return null;
    }
    else if (_.isString(value) && bcp_pattern.test(value)) {
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
 * @returns the same direction tag is returned, if valid, `undefined` otherwise. If the input value is `null`, it is returned unchanged.
 */
function check_direction_tag(value, logger) {
    if (value === null) {
        return null;
    }
    else if (_.isString(value) && (value === 'ltr' || value === 'rtl')) {
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
 */
function copy_object(from, to) {
    Object.getOwnPropertyNames(from).forEach((key) => to[key] = from[key]);
}
exports.copy_object = copy_object;
/**
 * Shorthand to check whether the object is a map that should be used recursively for further checks, i.e.,
 * whether it is an Entity or a Linked Resource
 *
 */
function recognized_type(obj) {
    return _.isObject(obj) && (obj instanceof manifest_classes_1.Entity_Impl || obj instanceof manifest_classes_1.LinkedResource_Impl);
}
exports.recognized_type = recognized_type;
/**
 * Get the `Terms` object assigned to a specific resource. See the definition of `Terms` for details.
 *
 * @param resource
 * @returns an instance of Terms
 */
function get_terms(resource) {
    if (resource instanceof manifest_classes_1.PublicationManifest_Impl || resource instanceof manifest_classes_1.Entity_Impl ||
        resource instanceof manifest_classes_1.LinkedResource_Impl || resource instanceof manifest_classes_1.LocalizableString_Impl) {
        return resource.terms;
    }
    else {
        return undefined;
    }
}
exports.get_terms = get_terms;
/**
 * Remove the fragment id part from a URL
 */
function remove_url_fragment(url) {
    let parsed = urlHandler.parse(url);
    delete parsed.hash;
    return urlHandler.format(parsed);
}
exports.remove_url_fragment = remove_url_fragment;
/**
 * Get the url values out of lists of Linked Resources, with (possible) fragment ID-s removed.
 *
 * Note that this method should only be invoked from places where the resources all have their `url` terms set.
 *
 */
function get_resources(resources) {
    return resources.map((item) => remove_url_fragment(item.url));
}
exports.get_resources = get_resources;
/* **************************** Logger **************************** */
/**
 * Simple logger class to record errors and warnings for subsequent display.
 */
class Logger {
    constructor() {
        this._validation_errors = [];
        this._fatal_errors = [];
    }
    get validation_errors() { return this._validation_errors; }
    get fatal_errors() { return this._fatal_errors; }
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
            final_message = `${final_message}; [Removing data]`;
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
     * Display all the fatal errors as one string.
     *
     */
    fatal_errors_toString() {
        return Logger._display(this.fatal_errors, 'Fatal Errors:');
    }
    /**
     * Display all the validation errors as one string.
     *
     */
    validation_errors_toString() {
        return Logger._display(this.validation_errors, 'Validation Errors:');
    }
    /**
     * Display all the messages as one string.
     *
     */
    toString() {
        return `${this.validation_errors_toString()}\n${this.fatal_errors_toString()}`;
    }
    /**
     * Generate a string for a category of messages.
     *
     * @static
     * @param messages - set of messages to display.
     * @param start - a text preceding the previous.
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