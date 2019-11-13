"use strict";
/**
 * Implementation of the Processing Steps.
 *
 * (As defined in
 * [§7 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#manifest-processing)).
 *
 * The functions, including their names, follow, as far as possible, the names used in the specification.
 *
 * The main entries of the module are
 *
 * - [[process_manifest]]
 * - [[generate_internal_representation]]
 *
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The interfaces defining the manifest interfaces. This is what the external world should
  'see' in the return value, i.e., _processed_
 */
const manifest_1 = require("./manifest");
/**
 * The implementations for the official interfaces, i.e., the bona fide classes
 */
const manifest_classes_1 = require("./lib/manifest_classes");
/**
 * Interfaces and instances for profile management
 */
const profile_1 = require("./lib/profile");
/**
 * Various utilities
 */
const utilities_1 = require("./lib/utilities");
/**
 * Manifest discovery function
 */
const manifest_discovery_1 = require("./lib/manifest_discovery");
const urlHandler = __importStar(require("url"));
const validUrl = __importStar(require("valid-url"));
const _ = __importStar(require("underscore"));
const moment_1 = __importDefault(require("moment"));
/**
 * Check whether an object is a “map” object (i.e., _not_ an array or a function in Javascript sense).
 *
 * Care should be taken of the fact that this is a misnomer: we are not referring to Typescript/Javascript `Map` types but, rather,
 * referring to the term used in the infra spec, used by the Pub Manifest specification. (The data structures start with JSON, and the `JSON.parse`
 * method returns an `Object` and not a `Map`. I.e., no `Map` is used in this code.)
 *
 * (This should really be an underscore function...)
 *
 * @param value
 */
const isMap = (value) => _.isObject(value) && !_.isArray(value) && !_.isFunction(value);
/**
 * Wrapper around a repetitive idiom of calling a callback function on all keys of an object.
 *
 * @param obj
 * @param callback
 */
const process_object_keys = (obj, callback) => {
    Object.getOwnPropertyNames(obj).forEach(callback);
};
/* ====================================================================================================
 Global objects and constants
 ====================================================================================================== */
/**
 * The URL of the 'default' profile for the conformance.
 * (This still has to be stabilize in the spec.)
 */
// const default_profile = 'https://www.w3.org/TR/pub-manifest/';
/**
 * The "known" profiles. This is just for testing purposes; a real life implementation should include
 * the URI-s for the profiles the user agent implements.
 */
// const known_profiles = [default_profile, 'https://www.w3.org/TR/audiobooks/']
/**
 * Structural resources' `rel` value. (These are treated specially by the algorithm)
 *
 * The algorithms' implementation uses this value only; i.e., new structural resource values can be added easily.
 */
const structural_resources = ["contents", "pagelist", "cover"];
/**
 * "Global data" object.
 *
 * These values are, conceptually, global variables shared among functions and extensions
 */
const global_data = new utilities_1.GlobalData();
/**
 * Process a manifest in two steps:
 *
 * 1. discover the manifest, per [§6 Manifest Discovery](https://www.w3.org/TR/pub-manifest/#manifest-discovery) (relying on the [[discover_manifest]] function);
 * 2. generate a publication manifest object, per [§7 Processing a Manifest](https://www.w3.org/TR/pub-manifest/#manifest-processing) (relying on the [[generate_internal_representation]] function).
 *
 * @async
 * @param url - The address of either the JSON file or the entry point in HTML
 * @param profiles - the sets of profiles that the caller can handle
 * @return - the generated manifest object and a logger
 */
async function process_manifest(url, profiles = [profile_1.default_profile]) {
    const logger = new utilities_1.Logger();
    let manifest_object = {};
    let args;
    try {
        args = await manifest_discovery_1.discover_manifest(url);
    }
    catch (err) {
        logger.log_fatal_error(`The manifest could not be discovered (${err.message})`);
        return { manifest_object, logger };
    }
    try {
        manifest_object = await generate_internal_representation(args, logger, profiles);
    }
    catch (err) {
        logger.log_fatal_error(`Some extra error occurred during generation (${err.message})`);
    }
    return { manifest_object, logger };
}
exports.process_manifest = process_manifest;
/* ====================================================================================================
 Direct utility functions within the processing steps

 (Factored out as separate functions for a better readability)
====================================================================================================== */
/**
 * Create a new entity, i.e., either a [[Person_Impl]] or an [[Organization_Impl]].
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * This corresponds to [§7.4.1/4](https://www.w3.org/TR/pub-manifest/#normalize-data).
 *
 * @param resource - either a string or a (originally JSON) object
 */
const create_Entity = (resource) => {
    if (resource === null) {
        // This should not happen, but better check, just to be on the safe side
        global_data.logger.log_validation_error(`Invalid entity`, resource, true);
        return undefined;
    }
    else if (_.isString(resource)) {
        const new_entity = new manifest_classes_1.Person_Impl();
        const new_person = new manifest_classes_1.LocalizableString_Impl();
        new_person.value = resource;
        new_entity.name = [new_person];
        new_entity.type = ["Person"];
        return new_entity;
    }
    else if (isMap(resource)) {
        // Beyond setting the type, the returned value should have the right (Typescript) type
        let new_entity;
        if (resource.type) {
            if (resource.type.includes('Person')) {
                new_entity = new manifest_classes_1.Person_Impl();
            }
            else if (resource.type.includes('Organization')) {
                new_entity = new manifest_classes_1.Organization_Impl();
            }
            else {
                resource.type.push('Person');
                new_entity = new manifest_classes_1.Person_Impl();
            }
        }
        else {
            new_entity = new manifest_classes_1.Person_Impl();
            resource.type = ['Person'];
        }
        utilities_1.copy_object(resource, new_entity);
        return new_entity;
    }
    else {
        global_data.logger.log_validation_error(`Invalid entity`, resource, true);
        return undefined;
        // Actually, returning undefined is a default action when no 'return' is present
        // but it is cleaner to make this explicit
    }
};
/**
 * Create a new [[LocalizableString_Impl]].
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * This corresponds to [§7.4.1/5](https://www.w3.org/TR/pub-manifest/#normalize-data).
 *
 * @param resource - either a string or a (originally JSON) object
 */
const create_LocalizableString = (resource) => {
    if (resource === null) {
        // This should not happen, but better check, just to be on the safe side
        global_data.logger.log_validation_error(`Invalid localizable string`, resource, true);
        return undefined;
    }
    else if (_.isString(resource)) {
        const new_ls = new manifest_classes_1.LocalizableString_Impl();
        new_ls.value = resource;
        if (global_data.lang !== '') {
            new_ls.language = global_data.lang;
        }
        if (global_data.dir !== '') {
            new_ls.direction = global_data.dir;
        }
        return new_ls;
    }
    else if (isMap(resource)) {
        const new_ls = new manifest_classes_1.LocalizableString_Impl();
        utilities_1.copy_object(resource, new_ls);
        if (new_ls.language) {
            if (new_ls.language === null)
                delete new_ls.language;
        }
        else if (global_data.lang !== '') {
            new_ls.language = global_data.lang;
        }
        if (new_ls.direction) {
            if (new_ls.direction === null)
                delete new_ls.direction;
        }
        else if (global_data.dir !== '') {
            new_ls.direction = global_data.dir;
        }
        return new_ls;
    }
    else {
        global_data.logger.log_validation_error(`Invalid localizable string`, resource, true);
        return undefined;
        // Actually, returning undefined is a default action when no 'return' is present
        // but it is cleaner to make this explicit
    }
};
/**
 * Create a new [[LinkedResource_Impl]].
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * This corresponds to [§7.4.1/6](https://www.w3.org/TR/pub-manifest/#normalize-data).
 *
 * @param resource - either a string or a (originally JSON) object
 */
const create_LinkedResource = (resource) => {
    if (resource === null) {
        // This should not happen, but better check, just to be on the safe side
        global_data.logger.log_validation_error(`Invalid Linked Resource`, resource, true);
        return undefined;
    }
    else if (_.isString(resource)) {
        const new_lr = new manifest_classes_1.LinkedResource_Impl();
        new_lr.url = resource;
        new_lr.type = ['LinkedResource'];
        return new_lr;
    }
    else if (isMap(resource)) {
        const new_lr = new manifest_classes_1.LinkedResource_Impl();
        utilities_1.copy_object(resource, new_lr);
        if (new_lr.type) {
            if (!new_lr.type.includes('LinkedResource')) {
                new_lr.type.push('LinkedResource');
            }
        }
        else {
            new_lr.type = ['LinkedResource'];
        }
        return new_lr;
    }
    else {
        // I am not sure this would occur at all but, just to be on the safe side...
        global_data.logger.log_validation_error(`Invalid Linked Resource`, resource, true);
        return undefined;
        // Actually, returning undefined is a default action when no 'return' is present
        // but it is cleaner to make this explicit
    }
};
/* ====================================================================================================
 The main processing steps, following the spec

 Note that the extension points' handling has not (yet) been implemented:

 The details of these are not really important in testing the spec...
====================================================================================================== */
/**
 * Process the manifest. This corresponds to the main body of
 * [§7.4  Publication Manifest](https://www.w3.org/TR/pub-manifest/#processing-algorithm), i.e., the starting
 * point of the algorithm.
 *
 * @param args - the arguments to the generation: the (JSON) text of the manifest, the base URL, and the (DOM) document object
 * @param base - base URL; if undefined or empty, fall back on the value of url
 * @param logger - an extra parameter to collect the error messages in one place, to be then processed by the caller
 * @param profiles - the sets of profiles that the caller can handle
 * @return - the processed manifest
 */
//export async function generate_internal_representation(url: URL, base: URL, logger: Logger): Promise<PublicationManifest> {
function generate_internal_representation(args, logger, profiles = [profile_1.default_profile]) {
    global_data.logger = logger;
    global_data.base = args.base;
    /* ============ The individual processing steps, following the spec ============== */
    /* Step: create the, initially empty, processed manifest */
    let processed = new manifest_classes_1.PublicationManifest_Impl();
    /* Step: get the manifest. */
    let manifest;
    try {
        manifest = JSON.parse(args.text);
    }
    catch (err) {
        // we ran into a JSON parsing issue...
        logger.log_fatal_error(`JSON parsing error: ${err.message}`, null, true);
        return {};
    }
    /* Step: extract and check the context */
    let contexts = [];
    if (manifest['@context']) {
        // To simplify, turn this into an array in any case
        contexts = utilities_1.toArray(manifest["@context"]);
        if (!(contexts.length >= 2 && contexts[0] === "https://schema.org" && contexts[1] === "https://www.w3.org/ns/pub-context")) {
            logger.log_fatal_error(`The required contexts are not provided`);
            return {};
        }
    }
    else {
        logger.log_fatal_error(`No context provided`);
        return {};
    }
    /* Step: profile conformance */
    if (!(manifest.conformsTo)) {
        // No conformance has been provided. That is, in this case, a validation error
        logger.log_validation_error(`No conformance was set (falling back to default)`);
        global_data.profile = profile_1.default_profile;
    }
    else {
        const conforms = utilities_1.toArray(manifest.conformsTo);
        // Gathering all profiles whose identifier is in the set of conforming profiles
        const acceptable_profiles = conforms.map((url) => {
            return profiles.find((profile) => profile.identifier === url);
        }).filter((item) => item !== undefined);
        if (acceptable_profiles.length === 0) {
            // No acceptable values were detected for the profile
            // At this point, the UA should inspect the media types and make a best guess.
            // This is not implemented, and the result of this test is supposed to be true...
            logger.log_validation_error(`No known conformance was set (falling back to default)`);
            global_data.profile = profile_1.default_profile;
            // If the non implemented test resulted in false, a Fatal Error should be added here:
            // logger.log_fatal_error(`Couldn't establish any acceptable profile`);
            // return {} as PublicationManifest
        }
        else {
            global_data.profile = acceptable_profiles[0];
        }
    }
    processed.profile = global_data.profile.identifier;
    /* Step: global declarations, ie, extract the global language and direction settings if any */
    {
        let lang = '';
        let dir = '';
        for (let i = contexts.length - 1; i >= 0; i--) {
            if (isMap(contexts[i])) {
                let c = contexts[i];
                if (lang === '' && c.language) {
                    lang = c.language;
                }
                if (dir === '' && c.direction) {
                    dir = c.direction;
                }
                if (lang !== '' && dir !== '')
                    break;
            }
        }
        if (lang !== '') {
            if (utilities_1.check_language_tag(lang, logger)) {
                global_data.lang = lang;
            }
            else {
                // error message is generated in the check_language_tag function;
            }
        }
        if (dir !== '') {
            if (utilities_1.check_direction_tag(dir, logger)) {
                global_data.dir = dir;
            }
            else {
                // error message is generated in the check_direction_tag function;
            }
        }
    }
    /* Step: go (recursively!) through all the term in manifest, normalize the value, an set it in processed */
    process_object_keys(manifest, (term) => {
        const value = manifest[term];
        const normalized = normalize_data(processed, term, value);
        if (normalized !== undefined) {
            processed[term] = normalized;
        }
    });
    /* Step: Data validation */
    processed = data_validation(processed);
    /* Step: add the HTML defaults */
    {
        const final = add_default_values(processed, args.document);
        if (final === null) {
            // A fatal error has been raised!
            return {};
        }
    }
    /* Step: Profile specific processing, and return: */
    return global_data.profile.generate_internal_representation(global_data, processed);
}
exports.generate_internal_representation = generate_internal_representation;
/**
 *
 * Normalize Data. This corresponds to the main body of
 * [§7.4.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#normalize-data).
 *
 * @param context - 'context', i.e., the object on which the function has been invoked
 * @param term - property term
 * @param value - property value
 * @returns - the “normalized” value, or `undefined` if a fatal error occurs
 */
function normalize_data(context, term, value) {
    /**
     * Helper function, to make the code below a bit more readable: normalize the content of a map. This
     * function calls (recursively) to the normalize_data function itself.
     *
     * Per spec if one of the values for a key in the map is undefined (i.e., 'failure') the key/value pair
     * is removed from the map.
     *
     * @param item the map to be normalized
     */
    const normalize_map = (item) => {
        if (utilities_1.recognized_type(item)) {
            process_object_keys(item, (key) => {
                const keyValue = item[key];
                const normalized_keyValue = normalize_data(item, key, keyValue);
                if (normalized_keyValue !== undefined) {
                    item[key] = normalized_keyValue;
                }
                else {
                    delete item[key];
                }
            });
        }
        return item;
    };
    // This is the important part of 'context' in this implementation: the categorization of terms of the context map
    const terms = utilities_1.get_terms(context);
    /* ============ The individual processing steps, following the spec ============== */
    /* Step: by default, the value should be the normalized value */
    let normalized = value;
    /* Step: the "@context" term should be skipped */
    if (term === '@context')
        return undefined;
    if (terms) {
        // This is one of those objects that have assigned terms.
        // In theory, any other objects can be added to the manifest and that should not be forbidden, just copied.
        /* Step: if necessary, normalization should turn single value to an array with that value */
        if (terms.array_terms.includes(term) && !_.isArray(value)) {
            // The 'toArray' utility checks and, if necessary, converts to array
            normalized = [value];
        }
        /* Step: converting entities into real ones, even if the information we have is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (terms.array_of_entities.includes(term)) {
            normalized = normalized.map(create_Entity).filter((entity) => entity !== undefined);
        }
        /* Step: converting strings into localizable strings, even if the information is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (terms.array_of_strings.includes(term)) {
            normalized = normalized.map(create_LocalizableString).filter((entity) => entity !== undefined);
        }
        /* Step: converting strings into Linked Resources, even if the information is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (terms.array_of_links.includes(term)) {
            normalized = normalized.map(create_LinkedResource).filter((entity) => entity !== undefined);
        }
        /* Step a: create an absolute URL from a string */
        if (terms.single_url.includes(term)) {
            // Note that the conversion function may return undefined, which is then forwarded back to the caller. Ie,
            // errors are handled.
            normalized = convert_to_absolute_URL(value);
        }
        /* Step b: create an array of absolute URLs from a strings */
        if (terms.array_of_urls.includes(term)) {
            if (_.isArray(normalized)) {
                normalized = normalized.map(convert_to_absolute_URL).filter((entity) => entity !== undefined);
            }
            else {
                global_data.logger.log_validation_error(`Invalid URL value for "${term}"`, normalized, true);
                return undefined;
            }
        }
    }
    /* Step: Profile specific normalization */
    normalized = global_data.profile.normalize_data(global_data, context, term, normalized);
    /* Step: recursively normalize the values of normalize */
    // A previous step may have set an undefined value, this has to be ignored, again just to be on the safe side
    if (normalized !== undefined) {
        if (_.isArray(normalized)) {
            // Go through each entry, normalize, and remove any undefined value
            normalized = normalized.map((item) => (isMap(item) ? normalize_map(item) : item)).filter((item) => item !== undefined);
        }
        else if (isMap(normalized)) {
            normalized = normalize_map(normalized);
        }
    }
    return normalized;
}
/**
 * Convert to absolute URL
 *
 * This is used for the implementation of step §4.3.1/5, i.e.,
* [§7.4.1.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#convert-absolute-url).
 *
 * @param url - the (absolute or relative) URL
 * @returns - the absolute URL using the `base` value of [[Global]], or `undefined` in case of error (e.g., invalid URL)
 */
const convert_to_absolute_URL = (url) => {
    if (!_.isString(global_data.base) || global_data.base === '' || global_data.base === null) {
        global_data.logger.log_validation_error(`Invalid base ${global_data.base}`, null, true);
        return undefined;
    }
    if (!_.isString(url) || url === '' || url === null) {
        global_data.logger.log_validation_error(`Invalid relative URL ${url}`, null, true);
        return undefined;
    }
    else {
        const new_url = urlHandler.resolve(global_data.base, url);
        // The check URL function checks the validity of the URL and whether it is a valid URL
        if (validUrl.isUri(new_url) === undefined) {
            global_data.logger.log_validation_error(`${new_url} is an invalid URL`);
            return undefined;
        }
        else {
            return new_url;
        }
    }
};
/**
 *
 * Data Validation. This corresponds to the main body of
 * [§7.4.2 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#validate-data).
 *
 * @param data - the data to be checked
 * @return - checked data (becomes the final value of `processed` in [[generate_internal_representation]] before returned to the caller)
 */
function data_validation(data) {
    // Only those terms should be used which have a definition in the spec, others should be ignored
    const terms = utilities_1.get_terms(data);
    const defined_terms = terms.all_terms;
    /* ============ The individual processing steps, following the spec ============== */
    /* Step: perform global data check. (That also includes value type checks.) */
    {
        // The misc terms should be ignored for the global data checks, they deserve
        // special treatment. That is why they are "misc"-s :-)
        const regular_terms = _.difference(defined_terms, terms.array_of_miscs);
        process_object_keys(data, (key) => {
            if (regular_terms.includes(key)) {
                data[key] = global_data_checks(data, key, data[key]);
                if (data[key] === undefined) {
                    delete data[key];
                }
            }
        });
    }
    /* Step: publication type */
    if (!data.type) {
        global_data.logger.log_validation_error(`Missing publication type (set default)`);
        data.type = ["CreativeWork"];
    }
    /* Step: accessibility */
    if (data.accessModeSufficient) {
        data.accessModeSufficient = data.accessModeSufficient.filter((ams) => {
            const check_value = isMap(ams) && ams.type && ams.type === 'ItemList';
            if (!check_value) {
                global_data.logger.log_validation_error(`Value of "accessModeSufficient" is invalid`, ams, true);
            }
            return check_value;
        });
    }
    /* Step: identifier check; has been mostly done by virtue of checking the URL */
    if (!data.id)
        global_data.logger.log_validation_error(`No id provided`);
    // This removes the '' string, if present
    delete data.id;
    /* Step: duration check */
    if (data.duration) {
        const durationCheck = RegExp('P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?');
        if (!(durationCheck.test(data.duration))) {
            global_data.logger.log_validation_error(`"${data.duration}" is an incorrect duration value`, null, true);
            delete data.duration;
        }
    }
    /* Step: last modification date */
    if (data.dateModified) {
        if (!moment_1.default(data.dateModified, moment_1.default.ISO_8601).isValid()) {
            global_data.logger.log_validation_error(`"${data.dateModified}" is an incorrect date string`, null, true);
            delete data.dateModified;
        }
    }
    /* Step: Publication date */
    if (data.datePublished) {
        if (!moment_1.default(data.datePublished, moment_1.default.ISO_8601).isValid()) {
            global_data.logger.log_validation_error(`"${data.datePublished}" is an incorrect date string`, null, true);
            delete data.datePublished;
        }
    }
    /* Step: inLanguage */
    if (data.inLanguage) {
        data.inLanguage = data.inLanguage.filter((item) => {
            const check_result = utilities_1.check_language_tag(item, global_data.logger);
            return check_result !== null && check_result !== undefined;
        });
    }
    /* Step: progression direction */
    if (data.readingProgression) {
        const check_result = utilities_1.check_direction_tag(data.readingProgression, global_data.logger);
        if (check_result === undefined)
            data.readingProgression = manifest_1.ProgressionDirection.ltr;
    }
    else {
        data.readingProgression = manifest_1.ProgressionDirection.ltr;
    }
    /* Step: check duplication in resources and in the readingOrder, and also set the unique resources' entry */
    {
        const readingOrderURLs = (data.readingOrder) ? get_unique_URLs(data.readingOrder) : [];
        const resourcesURLs = (data.resources) ? get_unique_URLs(data.resources) : [];
        data.uniqueResources = _.union(readingOrderURLs, resourcesURLs);
    }
    /* Step: Remove entries in "links" whose URL also appear in 'bounds' */
    if (data.links) {
        data.links = data.links.filter((link) => {
            const check_result = data.uniqueResources.includes(utilities_1.remove_url_fragment(link.url));
            if (check_result) {
                global_data.logger.log_validation_error(`${link.url} appears in "links" but is within the bounds of the publication`, null, true);
                return false;
            }
            else {
                if (!link["rel"] || link["rel"].length === 0) {
                    global_data.logger.log_validation_error(`Rel value in "links" not set`, link, false);
                }
                else {
                    const intersection = _.intersection(link["rel"], structural_resources);
                    if (intersection.length > 0) {
                        global_data.logger.log_validation_error(`Linked Resource in "links" includes "${intersection}"`, link, true);
                        return false;
                    }
                }
            }
            return true;
        });
    }
    /* Step: test on structural resources */
    {
        // create an object that has a boolean term for each structural resources initialized to false
        const flags = _.object(structural_resources, Array.from({ length: structural_resources.length }, (v, i) => false));
        const res1 = (data.readingOrder) ? data.readingOrder : [];
        const res2 = (data.resources) ? data.resources : [];
        [...res1, ...res2].forEach((resource) => {
            if (resource.rel) {
                structural_resources.forEach((str) => {
                    if (resource.rel.includes(str)) {
                        // we found a possible structural resource
                        if (flags[str] === true) {
                            // Duplicate, should not be used
                            global_data.logger.log_validation_error(`Multiple definition for the structural resource "${str}"`, resource, false);
                        }
                        else {
                            flags[str] = true;
                            // For the 'cover' case, there is an extra check for an image
                            if (str === 'cover' && resource.encodingFormat && resource.encodingFormat.startsWith('image/') && !resource.name) {
                                global_data.logger.log_validation_error(`No name provided for a cover page image`, resource, false);
                            }
                        }
                    }
                });
            }
        });
    }
    /* Step: profile extension point */
    data = global_data.profile.data_validation(global_data, data);
    /* Step: run remove empty arrays */
    // Care should be taken to run this only on entries that are part of the definition of this object!
    // The previous step may have raised a fatal error, better check
    if (data !== undefined) {
        process_object_keys(data, (key) => {
            if (defined_terms.includes(key)) {
                if (!(remove_empty_arrays(data[key]))) {
                    delete data[key];
                }
            }
        });
    }
    return data;
}
/**
 *
 * Global Data Check. This corresponds to the main body of
 * [§7.4.2.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#global-data-checks).
 *
 * This is a recursive function.
 *
 * @param context - 'context', i.e., the object on which the function has been invoked
 * @param term - property term
 * @param value - property value
 * @return - the normalized value or `undefined`, in case of error
 */
function global_data_checks(context, term, value) {
    const terms = utilities_1.get_terms(context);
    if (terms) {
        /* Step: see if the term has a known value category and check that value. */
        // "known value category" means, in this case, that the term is known for the specific context
        // the "misc" entries should be excluded, though; they have to go through an explicit check,
        // that is whey they are "misc"-s...
        if (terms.all_terms.includes(term)) {
            if (verify_value_category(context, term, value) === false) {
                return undefined;
            }
        }
        /* Step: recursively to do data check at this point! */
        {
            /**
             * Helper function to make the code a bit more readable: the recursive step
             * to invoke the global data check on the key/value pair of a map.
             *
             * @param item - the map to be checked
             * @returns - the original map but with key/value checked and, possibly, removed if error occurred
             */
            const map_data_check = (item) => {
                if (utilities_1.recognized_type(item)) {
                    process_object_keys(item, (key) => {
                        const keyValue = item[key];
                        item[key] = global_data_checks(item, key, keyValue);
                        if (item[key] === undefined) {
                            delete item[key];
                        }
                    });
                }
                return item;
            };
            if (isMap(value)) {
                map_data_check(value);
            }
            else if (_.isArray(value)) {
                value = value.map(map_data_check);
            }
        }
        /* Step: check the value of language and direction, possibly removing the value */
        if (terms.array_of_strings.includes(term)) {
            value = value.filter((item) => {
                if (!item.value) {
                    global_data.logger.log_validation_error(`Missing value for a Localizable String`, item, true);
                    return false;
                }
                if (item.language) {
                    const lang_check = utilities_1.check_language_tag(item.language, global_data.logger);
                    if (lang_check === undefined || lang_check === null) {
                        delete item.language;
                    }
                }
                if (item.direction) {
                    const dir_check = utilities_1.check_direction_tag(item.direction, global_data.logger);
                    if (dir_check === undefined || dir_check === null) {
                        delete item.direction;
                    }
                }
                return true;
            });
        }
        /* Step: an entity must have a name */
        if (terms.array_of_entities.includes(term)) {
            value = value.filter((item) => {
                if (!item.name) {
                    global_data.logger.log_validation_error(`Missing name for a Person or Organization in "${term}"`, item, true);
                    return false;
                }
                else {
                    item.name = item.name.filter((name) => (name.value && name.value !== ''));
                    return true;
                }
            });
        }
        /* Step: check linked resources; it must have a url, and the value of length and alternate must be checked, too */
        if (terms.array_of_links.includes(term)) {
            value = value.filter((resource) => {
                if (!resource.url) {
                    global_data.logger.log_validation_error(`URL is missing from a linked resource in "${term}"`, resource, true);
                    return false;
                }
                else {
                    if (validUrl.isUri(resource.url) === undefined) {
                        global_data.logger.log_validation_error(`"${resource.url}" is is not a valid URL`, null, true);
                        return false;
                    }
                }
                if (resource.length) {
                    if (!(_.isNumber(resource.length) && resource.length >= 0)) {
                        global_data.logger.log_validation_error(`Linked Resource length is is invalid in  "${term}"`, resource, true);
                        return false;
                    }
                }
                return true;
            });
        }
    }
    return value;
}
/**
 *
 * Verify the value category. This corresponds to the main body of
 * [§7.4.2.2 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#verify-value-category).
 *
 * @param context - 'context', in this case the object that has invoked the function
 * @param term - property term
 * @param value - property value
 * @return - result of the category check
 */
function verify_value_category(context, term, value) {
    /**
     * Check a key/value pair's validity using the categorization defined in keys.
     * @param keys - the [[Term]] instance controlling the value constraints
     * @param key
     * @param val - the value for the key
     */
    const check_expected_type = (keys, key, val) => {
        if (keys.array_or_single_literals.includes(key)) {
            return _.isString(val);
        }
        else if (keys.array_of_strings.includes(key)) {
            return val instanceof manifest_classes_1.LocalizableString_Impl;
        }
        else if (keys.array_of_entities.includes(key)) {
            return val instanceof manifest_classes_1.Entity_Impl;
        }
        else if (keys.array_of_links.includes(key)) {
            return val instanceof manifest_classes_1.LinkedResource_Impl;
        }
        else if (keys.array_or_single_urls.includes(key)) {
            return _.isString(val);
        }
        else if (keys.single_number.includes(key)) {
            return _.isNumber(val);
        }
        else if (keys.single_boolean.includes(key)) {
            return _.isBoolean(val);
        }
        else {
            // No constraint defined
            return true;
        }
    };
    /**
     * Check a key/value pair's validity using the categorization defined in keys; raise an validation error if the value is not valid
     *
     * @param keys - the [[Term]] instance controlling the value constraints
     * @param key
     * @param val - the value for the key
     */
    const check_expected_type_and_report = (keys, key, val) => {
        const check_result = check_expected_type(keys, key, val);
        if (!check_result) {
            global_data.logger.log_validation_error(`Type validation error for "${key}":`, value, true);
        }
        return check_result;
    };
    /**
     * (Recursively) verify the value categories for the key/value pairs in an object: it calls [[verify_value_category]] on all pairs.
     * Usually returns true, except if, after all checks, the map is emptied.
     *
     * @param obj - the object to be checked.
     */
    const verify_map = (obj) => {
        const keys = utilities_1.get_terms(obj);
        const defined_terms = keys.all_terms;
        process_object_keys(obj, (key) => {
            if (defined_terms.includes(key)) {
                const check_result = verify_value_category(obj, key, obj[key]);
                if (!(check_result)) {
                    delete obj[key];
                }
            }
        });
        // Check if there is any meaningful term left!
        if (defined_terms.find((key) => Object.getOwnPropertyNames(obj).includes(key))) {
            return true;
        }
        else {
            return false;
        }
    };
    const terms = utilities_1.get_terms(context);
    if (terms.array_terms.includes(term)) {
        if (!(_.isArray(value))) {
            global_data.logger.log_validation_error(`Value should be an array for "${term}"`, value);
            return false;
        }
        else {
            if (value.length !== 0) {
                value = value.map((item) => {
                    if (check_expected_type_and_report(terms, term, item)) {
                        if (isMap(item)) {
                            return verify_map(item) ? item : undefined;
                        }
                        else {
                            return item;
                        }
                    }
                    else {
                        // wrong type
                        return undefined;
                    }
                }).filter((item) => item !== undefined);
                if (value.length === 0) {
                    global_data.logger.log_validation_error(`Empty array after value type check for "${term}"`, null, true);
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return true;
            }
        }
    }
    else if (terms.maps.includes(term)) {
        if (!(isMap(value))) {
            global_data.logger.log_validation_error(`Value should be a map for "${term}"`, value);
            return false;
        }
        else {
            return verify_map(value);
        }
    }
    else {
        return check_expected_type_and_report(terms, term, value);
    }
}
/**
 *
 *  Obtain a list of unique resources. This corresponds to the main body of
 * [§7.4.2.3 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#get-unique-urls).
 *
 * @param resources
 * @returns - the full list of unique resources
 */
function get_unique_URLs(resources) {
    const uniqueResources = new utilities_1.OrderedSet();
    const get_url_from_link = (link) => {
        const check_result = uniqueResources.push(utilities_1.remove_url_fragment(link.url));
        if (!check_result) {
            global_data.logger.log_validation_error(`Duplicate value for ${link.url}`);
        }
    };
    const get_all_urls_from_link = (link) => {
        get_url_from_link(link);
        if (link.alternate) {
            link.alternate.forEach(get_all_urls_from_link);
        }
    };
    resources.forEach(get_all_urls_from_link);
    return uniqueResources.content;
}
/**
 *
 * Remove empty arrays. This corresponds to the main body of
 * [§7.4.2.4 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#remove-empty-arrays).
 *
 * The function is a slight misnomer: it checks whether the incoming value is an array and, if yes, checks whether it is empty or not; however
 * if the value is an objects, it looks for the constituent arrays and removes the empty ones from the object.
 *
 * @param value - the data to be checked
 * @return - `false` if the the value is an empty array, `true` otherwise
 */
function remove_empty_arrays(value) {
    if (_.isArray(value) && value.length === 0) {
        return false;
    }
    else if (isMap(value)) {
        process_object_keys(value, (key) => {
            const keyValue = value[key];
            if (!remove_empty_arrays(keyValue)) {
                delete value[key];
            }
        });
    }
    return true;
}
/**
 * Add default values. This corresponds to
 * [§7.4.3 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#add-html-defaults).
 *
 * @param data - the (almost) final processed manifest
 * @param document - the Document DOM node for the entry point, `undefined` if the process happens without such an entry point
 * @returns - `null` if a fatal error has been raised, the original (albeit possibly modified) data otherwise.
 */
function add_default_values(data, document = undefined) {
    /*
    * Minor helper function on DOM manipulation: get the value of an attribute by also
    * going up the DOM tree to get a possible inherited value. Used to locate the language or the
    * direction of the title element.
    */
    const get_attr = (start, term) => {
        let element = start;
        do {
            const attr = element.getAttribute(term);
            if (attr !== null) {
                return attr;
            }
            else {
                element = element.parentElement;
            }
        } while (element !== null);
        return '';
    };
    if (!data.name) {
        let ls;
        if (document !== undefined) {
            const title = document.querySelector('title');
            if (title) {
                ls = create_LocalizableString(title.text);
                const lang = get_attr(title, "lang");
                if (lang !== '') {
                    ls.language = lang;
                }
                const dir = get_attr(title, "dir");
                if (dir !== '') {
                    ls.direction = dir;
                }
                data.name = [ls];
            }
            else {
                ls = create_LocalizableString('*No Title*');
                global_data.logger.log_validation_error('No title element to set as a default "name"', null, false);
            }
        }
        else {
            ls = create_LocalizableString('*No Title*');
            global_data.logger.log_validation_error('No "name" set and no default value', null, false);
        }
        data.name = [ls];
    }
    if (!data.readingOrder || data.readingOrder.length === 0) {
        if (document !== undefined) {
            if (!document.location.href) {
                global_data.logger.log_fatal_error("Empty reading order, and no URL assigned to the HTML entry point to serve as default", null, false);
                return null;
            }
            else {
                data.readingOrder = [create_LinkedResource(document.location.href)];
                if (!data.uniqueResources.includes(document.location.href)) {
                    data.uniqueResources.push(document.location.href);
                }
            }
        }
        else {
            global_data.logger.log_fatal_error("Empty reading order", null, false);
            return null;
        }
    }
    /* Profile specific fallback */
    return global_data.profile.add_default_values(global_data, data, document);
}
//# sourceMappingURL=process.js.map