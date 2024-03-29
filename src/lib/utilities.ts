/**
 * Various utilities
 */

/**
 * The core interfaces that are implemented in project
 */
import {
    URL,
    PublicationManifest,
    LinkedResource,
    LocalizableString,
    Entity,
    Person,
    Organization,
    ProgressionDirection
} from '../manifest';

import {
    Entity_Impl,
    Person_Impl,
    Organization_Impl,
    LocalizableString_Impl,
    LinkedResource_Impl,
    RecognizedTypes_Impl,
    PublicationManifest_Impl,
    new_Entity_Impl, isEntity_Impl,
    new_LocalizableString_Impl,  isLocalizableString_Impl,
    new_LinkedResource_Impl, isLinkedResource_Impl,
    Terms
} from './terms';

import { Profile } from './profile';

import * as _ from 'underscore';
import * as urlHandler from 'url';

/**
 * "Global data" object.
 *
 * These values are, conceptually, global variables shared among functions and profile extensions.
 *
 * An instance of this class is set up at the beginning of the processing, is shared among functions and
 * is made available to all profile extensions.
 */
class GlobalData {
    /** A [[Logger]] instance used to store the fatal and validation errors during processing. */
    logger: Logger;

    /** Global language tag declaration */
    lang: string = '';

    /** Global base direction declaration */
    dir: string = '';

    /** Global base URL */
    base: URL = '';

    /** PEP document reference */
    document: HTMLDocument = undefined;

    /** Final profile for the User Agent (stored only for testing purpose, not really used). */
    profile: Profile;

    /** Debug mode set */
    debug: boolean = false;
};

/**
 * "Global data" object.
 *
 * These values are, conceptually, global variables shared among functions and extensions
 */
export const Global: GlobalData = new GlobalData();

/* **************************** General utilities **************************** */

/** Query selector string for ToC */
export const toc_query_selector = '*[role*="doc-toc"]';

/**
 * Turn an array of strings into an array of lower case equivalents
 * @param arg incoming array of strings
 */
export function lower(arg: string[]): string[] {
    return arg.map((value: string): string => value.toLowerCase())
}

/**
 * Name tells it all: if the argument is  single value, it is encapsulated into
 * an array. Used for Localizable String, Linked Resources, etc.
 *
 * @param arg - the input value or array of values
 */
export function toArray(arg: any): any[] {
    return Array.isArray(arg) ? arg : [arg];
}

/** Regex used to check whether a string is a valid BCP47 value */
const bcp_pattern = RegExp('^(((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((([A-Za-z]{2,3}(-(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+))$');
/**
 * Check the well-formedness, per BCP47, of a language tag.
 *
 * @param value - language tag
 * @param logger - logger for errors
 * @returns the same language tag is returned, if valid, `undefined` otherwise. If the input value is `null`, it is returned unchanged.
 */
export function check_language_tag(value: string, logger: Logger): string {
    if (value === null) {
        return null;
    } else if (_.isString(value) && bcp_pattern.test(value)) {
        return value;
    } else {
        logger.log_strong_validation_error(`Invalid BCP47 format for language tag: "${value}"`);
        return undefined;
    }
}

/**
 * Check the well-formedness of a direction tag.
 *
 * @param value - direction tag
 * @param logger - logger for errors
 * @returns - the same direction tag is returned, if valid, `undefined` otherwise. If the input value is `null`, it is returned unchanged.
 */
export function check_direction_tag(value: string, logger: Logger): string {
    if (value === null) {
        return null;
    } else if (_.isString(value) && (value === 'ltr' || value === 'rtl')) {
        return value;
    } else {
        logger.log_strong_validation_error(`Invalid base direction tag: "${value}"`);
        return undefined;
    }
}

/** Regex used to check whether a string is a valid duration value */
const durationCheck = RegExp('P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?');
/**
 * Check the well-formedness of a duration string value.
 * @param value
 * @param logger
 */
export function check_duration_value(value: string, logger: Logger): boolean {
    if (!(durationCheck.test(value))) {
        logger.log_strong_validation_error(`"${value}" is an incorrect duration value`);
        return false;
    } else {
        return true;
    }
}

/**
 * (Shallow) copy of the object. It seems to be necessary to do it this way to ensure that the 'to' object
 * gets and maintains the correct Typescript type.
 *
 * @param from - a generic (Javascript) object, as generated by a JSON parser
 * @param to - a (corresponding) Typescript class, implementing an [[Entity]], [[LocalizableString]], [[LinkedResource]], or [[PublicationManifest]]
 * @returns - value of `to`, with all the values copied.
 *
 */
export function copy_object(from: any, to: any): void {
    Object.getOwnPropertyNames(from).forEach((key:string):void => to[key] = from[key]);
}

/**
 * Shorthand to check whether the object is a map that should be used recursively for further checks, i.e.,
 * whether it is an [[Entity]] or a [[LinkedResource]].
 *
 */
export function recognized_type(obj: any): boolean {
    return _.isObject(obj) && (isEntity_Impl(obj) || isLinkedResource_Impl(obj));
}

/**
 * Get the [[Terms]] object assigned to a specific resource. See the definition of [[Terms]] for details.
 *
 * @param resource
 * @returns - an instance of Terms
 */
export function get_terms(resource: any): Terms {
    if (resource.$terms !== undefined) {
        return resource.$terms instanceof Terms ? resource.$terms as Terms : undefined;
    } else {
        return undefined
    }
}

/**
 * Remove the fragment id part from a URL
 */
export function remove_url_fragment(url: URL): URL {
    let parsed = urlHandler.parse(url);
    delete parsed.hash;
    return urlHandler.format(parsed);
}

/**
 * Get the url values out of lists of Linked Resources, with (possible) fragment ID-s removed.
 *
 * Note that this method should only be invoked from places where the resources all have their `url` terms set. Used, e.g., to
 * list the resources defined on resource in reading order.
 *
 */
export function get_resources(resources: LinkedResource[]): URL[] {
    return resources.map((item: LinkedResource) => remove_url_fragment(item.url))
}

/* **************************** Logger **************************** */

interface Log {
    "Error message": string,
    "Problematic Object"?: any
}

/**
 * Simple logger class to record errors and warnings for subsequent display.
 *
 * The processing should stop only in very rare cases, so throwing exception at a validation error is not the good approach, hence this
 * class.
 */
export class Logger {
    "Fatal errors": Log[]               = [];
    "Warnings with data removal": Log[] = [];
    "Warnings": Log[]                   = [];

    isEmpty(): boolean {
        return this["Fatal errors"].length === 0 && this["Warnings with data removal"].length === 0 && this["Warnings"].length === 0;
    }

    /**
     * Log an error
     *
     * @param level
     * @param message - the message that should be logged, possibly, in case the condition is false
     * @param obj - an optional object that should be added to the message in JSON
     */
    private log(target: Log[], message: string, obj: any) : void {
        const error: Log = {
            "Error message" : message,
        }
        if (obj !== null) {
            error["Problematic Object"] = JSON.parse(JSON.stringify(obj,(key, value) =>  key === '$terms' ? undefined : value));
        }
        target.push(error);
    }

    /**
     * Log a light validation error
     *
     * @param message - the message that should be logged, possibly, in case the condition is false
     * @param obj - an optional object that should be added to the message in JSON
     */
    log_light_validation_error(message: string, obj: any = null): void {
        this.log(this["Warnings"], message, obj);
    }

    /**
     * Log strong validation error
     *
     * @param message - the message that should be logged, possibly, in case the condition is false
     * @param obj - an optional object that should be added to the message in JSON
     */
    log_strong_validation_error(message: string, obj: any = null): void {
        this.log(this["Warnings with data removal"], message, obj);
    }

    /**
     * Log a fatal error
     *
     * @param message - the message that should be logged, possibly, in case the condition is false
     * @param obj - an optional object that should be added to the message in JSON
     * @param required - an optional flag whether a final remark should be added on removing faulty data (i.e., whether the feature is required or not)
     */
    log_fatal_error(message: string, obj: any = null): void {
        this.log(this["Fatal errors"], message, obj);
    }
}

/* **************************** Ordered set **************************** */

/**
 * "Ordered Set", in the terminology of the infra standard, i.e, a wrapper around a list that contains mutually distinct values.
 * that is pushed on the set.
 *
 * @typeparam T - simple type (numbers, booleans, strings), usable for an array's `includes` function.
*/
export class OrderedSet<T> {
    private _content: T[] = [];

    /**
     * Push a new value to the set, if it is new.
     *
     * @param value - new value
     * @returns - true if the value has been added (i.e., it is a new value), false otherwise.
     */
    push (value: T): boolean {
        if (this._content.includes(value)) {
            return false;
        } else {
            this._content.push(value);
            return true;
        }
    }
    get content(): T[] {
        return this._content;
    }
}
