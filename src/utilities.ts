import {
    PublicationManifest,
    LinkedResource,
    LocalizableString,
    Entity,
    Person,
    Organization,
    ProgressionDirection
} from './manifest';

import {
    Entity_Impl,
    Person_Impl,
    Organization_Impl,
    LocalizableString_Impl,
    LinkedResource_Impl,
    RecognizedTypes_Impl,
    PublicationManifest_Impl,
    Terms,
    URL
} from './manifest_classes';

import * as fetch from 'node-fetch';
import * as _ from 'underscore';
import * as urlHandler from 'url';

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
    } else if (_.isString(value) && bcp_pattern.test(value)) {
        return value;
    } else {
        logger.log_validation_error(`Invalid BCP47 format for language tag ${value}`, null, true);
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
    } else if (_.isString(value) && (value === 'ltr' || value === 'rtl')) {
        return value;
    } else {
        logger.log_validation_error(`Invalid base direction tag (${value})`, null, true);
        return undefined;
    }
}

/**
 * (Shallow) copy of the object. It seems to be necessary to do it this way to ensure that the 'to' object
 * gets and maintains the correct Typescript type
 *
 * @param from
 * @param to
 */
export function copy_object(from: any, to: any): void {
    Object.getOwnPropertyNames(from).forEach((key:string):void => to[key] = from[key]);
}

/**
 * Shorthand to check whether the object is a map that should be used recursively for further checks.
 *
 * @param obj
 */
export function recognized_type(obj: any): boolean {
    return _.isObject(obj) && (obj instanceof Entity_Impl || obj instanceof LinkedResource_Impl);
}

/**
 * Get the Terms object assigned to a specific resource. See the definition of Terms for details.
 *
 * @param resource
 * @returns an instance of Terms
 */
export function get_terms(resource: any): Terms {
    if (resource instanceof PublicationManifest_Impl || resource instanceof Entity_Impl ||
        resource instanceof LinkedResource_Impl || resource instanceof LocalizableString_Impl)
    {
        return resource.terms
    } else {
        return undefined;
    }
}

/**
 * Remove the fragment from a URL
 */
export function remove_url_fragment(url: URL): URL {
    let parsed = urlHandler.parse(url);
    delete parsed.hash;
    return urlHandler.format(parsed);
}

/**
 * Compare two URLs with their fragments removed
 * @param url1 C
 * @param url2
 */
export function compare_urls(url1: URL, url2: URL): boolean {
    return remove_url_fragment((url1)) === remove_url_fragment(url2)
}

/**
 * Get the url values out of Linked Resource objects.
 *
 * Note that this method should only be invoked from places where the resources all have their `url` terms set.
 *
 */
export function get_resources(resources: LinkedResource[]): URL[] {
    return resources.map((item: LinkedResource) => remove_url_fragment(item.url))
}

/* **************************** Logger **************************** */

/**
 * Simple logger class to record errors and warnings for subsequent display
 */
export class Logger {
    private _validation_errors: string[] = [];
    get validation_errors(): string[] { return this._validation_errors; }

    private _fatal_errors: string[]      = [];
    get fatal_errors() : string[] { return this._fatal_errors; }

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
    private log(target: string[], message: string, obj: any, required: boolean) : void {
        let final_message = obj === null ? `${message}` : `${message} (${JSON.stringify(obj)})`;
        if (required) final_message = `${final_message}; [Removing data]`;
        target.push(final_message);
    }

    /**
     * Log a validation error
     *
     * @param message - the message that should be logged, possibly, in case the condition is false
     * @param obj - an optional object that should be added to the message in JSON
     * @param required - an optional flag whether a final remark should be added on whether that is a required or recommended feature
     */
    log_validation_error(message: string, obj: any = null, required: boolean = false): void {
        this.log(this._validation_errors, message, obj, required);
    }

    /**
     * Log a fatal error
     *
     * @param message - the message that should be logged, possibly, in case the condition is false
     * @param obj - an optional object that should be added to the message in JSON
     * @param required - an optional flag whether a final remark should be added on whether that is a required or recommended feature
     */
    log_fatal_error(message: string, obj: any = null, required: boolean = false): void {
        this.log(this._fatal_errors, message, obj, required);
    }

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
