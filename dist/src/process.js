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
 *  * @author Ivan Herman <ivan@w3.org>
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
const terms_1 = require("./lib/terms");
/**
 * Interfaces and instances for profile management
 */
const profile_1 = require("./lib/profile");
/**
 * Interface for the ToC extraction function
 */
const toc_1 = require("./lib/toc");
/**
 * Various utilities
 */
const utilities_1 = require("./lib/utilities");
/**
 * Manifest discovery function
 */
const discovery_1 = require("./lib/discovery");
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
 * Process a manifest in two steps:
 *
 * 1. discover the manifest, per [§6 Manifest Discovery](https://www.w3.org/TR/pub-manifest/#manifest-discovery) (relying on the [[discover_manifest]] function);
 * 2. generate a publication manifest object, per [§7 Processing a Manifest](https://www.w3.org/TR/pub-manifest/#manifest-processing) (relying on the [[generate_internal_representation]] function).
 *
 * @async
 * @param url - The address of either the JSON file or the entry point in HTML
 * @param profiles - the sets of profiles that the caller can handle
 * @param debug - whether to use debug mode for running the processes
 * @return - the generated manifest object and a logger
 */
async function process_manifest(url, profiles = [profile_1.default_profile], debug = false) {
    const logger = new utilities_1.Logger();
    utilities_1.Global.debug = debug;
    let manifest_object = {};
    let args;
    try {
        args = await discovery_1.discover_manifest(url);
    }
    catch (err) {
        logger.log_fatal_error(`The manifest could not be discovered (${err.message})`);
        return { manifest_object, logger };
    }
    try {
        manifest_object = await generate_internal_representation(args, logger, profiles);
    }
    catch (err) {
        logger.log_fatal_error(`Some extra error occurred during generation (${err.toString()})`);
        if (utilities_1.Global.debug)
            console.log(err);
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
        utilities_1.Global.logger.log_strong_validation_error(`Invalid entity`, resource);
        return undefined;
    }
    else if (_.isString(resource)) {
        const new_entity = terms_1.new_Entity_Impl();
        const new_person = terms_1.new_LocalizableString_Impl();
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
                new_entity = terms_1.new_Entity_Impl();
            }
            else if (resource.type.includes('Organization')) {
                new_entity = terms_1.new_Entity_Impl();
            }
            else {
                resource.type.push('Person');
                new_entity = terms_1.new_Entity_Impl();
            }
        }
        else {
            new_entity = terms_1.new_Entity_Impl();
            resource.type = ['Person'];
        }
        utilities_1.copy_object(resource, new_entity);
        return new_entity;
    }
    else {
        utilities_1.Global.logger.log_strong_validation_error(`Invalid entity`, resource);
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
        utilities_1.Global.logger.log_strong_validation_error(`Invalid localizable string`, resource);
        return undefined;
    }
    else if (_.isString(resource)) {
        const new_ls = terms_1.new_LocalizableString_Impl();
        new_ls.value = resource;
        if (utilities_1.Global.lang !== '') {
            new_ls.language = utilities_1.Global.lang;
        }
        if (utilities_1.Global.dir !== '') {
            new_ls.direction = utilities_1.Global.dir;
        }
        return new_ls;
    }
    else if (isMap(resource)) {
        const new_ls = terms_1.new_LocalizableString_Impl();
        utilities_1.copy_object(resource, new_ls);
        if (new_ls.language) {
            if (new_ls.language === null)
                delete new_ls.language;
        }
        else if (utilities_1.Global.lang !== '') {
            new_ls.language = utilities_1.Global.lang;
        }
        if (new_ls.direction) {
            if (new_ls.direction === null)
                delete new_ls.direction;
        }
        else if (utilities_1.Global.dir !== '') {
            new_ls.direction = utilities_1.Global.dir;
        }
        return new_ls;
    }
    else {
        utilities_1.Global.logger.log_strong_validation_error(`Invalid localizable string`, resource);
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
        utilities_1.Global.logger.log_strong_validation_error(`Invalid Linked Resource`, resource);
        return undefined;
    }
    else if (_.isString(resource)) {
        const new_lr = terms_1.new_LinkedResource_Impl();
        new_lr.url = resource;
        new_lr.type = ['LinkedResource'];
        return new_lr;
    }
    else if (isMap(resource)) {
        const new_lr = terms_1.new_LinkedResource_Impl();
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
        utilities_1.Global.logger.log_strong_validation_error(`Invalid Linked Resource`, resource);
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
 * @async
 * @param args - the arguments to the generation: the (JSON) text of the manifest, the base URL, and the (DOM) document object
 * @param base - base URL; if undefined or empty, fall back on the value of url
 * @param logger - an extra parameter to collect the error messages in one place, to be then processed by the caller
 * @param profiles - the sets of profiles that the caller can handle
 * @return - the processed manifest
 */
async function generate_internal_representation(args, logger, profiles = [profile_1.default_profile]) {
    utilities_1.Global.logger = logger;
    utilities_1.Global.base = args.base;
    utilities_1.Global.document = args.document;
    /* ============ The individual processing steps, following the spec ============== */
    /* Step: create the, initially empty, processed manifest */
    let processed = terms_1.new_PublicationManifest_Impl();
    /* Step: get the manifest. */
    let manifest;
    try {
        manifest = JSON.parse(args.text);
    }
    catch (err) {
        // we ran into a JSON parsing issue...
        logger.log_fatal_error(`JSON parsing error: ${err.message}`);
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
        logger.log_light_validation_error(`No conformance was set (falling back to default)`);
        utilities_1.Global.profile = profile_1.default_profile;
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
            logger.log_light_validation_error(`No known conformance was set (falling back to default)`);
            utilities_1.Global.profile = profile_1.default_profile;
            // If the non implemented test resulted in false, a Fatal Error should be added here:
            // logger.log_fatal_error(`Couldn't establish any acceptable profile`);
            // return {} as PublicationManifest
        }
        else {
            utilities_1.Global.profile = acceptable_profiles[0];
        }
    }
    processed.profile = utilities_1.Global.profile.identifier;
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
                utilities_1.Global.lang = lang;
            }
            else {
                // error message is generated in the check_language_tag function;
            }
        }
        if (dir !== '') {
            if (utilities_1.check_direction_tag(dir, logger)) {
                utilities_1.Global.dir = dir;
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
    // if the data validation returned undefined, i.e., a fatal error, we should stop here...
    if (processed === null)
        return {};
    /* Step: add the HTML defaults */
    {
        const final = add_default_values(processed);
        if (final === null) {
            // A fatal error has been raised!
            return {};
        }
    }
    /* Step: Profile specific processing, and return: */
    const retval_impl = utilities_1.Global.profile.generate_internal_representation(processed);
    /* Step: Extract the ToC */
    retval_impl.toc = await toc_1.generate_TOC(retval_impl);
    // Doing an ugly trick here. The objects are all '_impl', meaning that they contain additional data
    // that are only necessary for processing and not for the rest, namely '$terms'. To filter them all out
    // the most straightforward way is to convert the object into JSON and back but, along the line,
    // filter those unwanted keys out.
    const retval = JSON.parse(JSON.stringify(retval_impl, (key, value) => key === '$terms' ? undefined : value));
    return retval;
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
        if (terms.is_array_term(term) && !_.isArray(value)) {
            // The 'toArray' utility checks and, if necessary, converts to array
            normalized = [value];
        }
        /* Step: converting entities into real ones, even if the information we have is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (terms.is_entities_term(term)) {
            normalized = normalized.map(create_Entity).filter((entity) => entity !== undefined);
        }
        /* Step: converting strings into localizable strings, even if the information is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (terms.is_strings_term(term)) {
            normalized = normalized.map(create_LocalizableString).filter((entity) => entity !== undefined);
        }
        /* Step: converting strings into Linked Resources, even if the information is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (terms.is_links_term(term)) {
            normalized = normalized.map(create_LinkedResource).filter((entity) => entity !== undefined);
        }
        /* Step a: create an absolute URL from a string */
        if (terms.is_single_url_term(term)) {
            // Note that the conversion function may return undefined, which is then forwarded back to the caller. Ie,
            // errors are handled.
            normalized = convert_to_absolute_URL(value);
        }
        /* Step b: create an array of absolute URLs from a strings */
        if (terms.is_urls_term(term)) {
            if (_.isArray(normalized)) {
                normalized = normalized.map(convert_to_absolute_URL).filter((entity) => entity !== undefined);
            }
            else {
                utilities_1.Global.logger.log_strong_validation_error(`Invalid URL value for "${term}"`, normalized);
                return undefined;
            }
        }
    }
    /* Step: Profile specific normalization */
    normalized = utilities_1.Global.profile.normalize_data(context, term, normalized);
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
    if (!_.isString(utilities_1.Global.base) || utilities_1.Global.base === '' || utilities_1.Global.base === null) {
        utilities_1.Global.logger.log_strong_validation_error(`Invalid base ${utilities_1.Global.base}`);
        return undefined;
    }
    if (!_.isString(url) || url === '' || url === null) {
        utilities_1.Global.logger.log_strong_validation_error(`Invalid relative URL ${url}`);
        return undefined;
    }
    else {
        const new_url = urlHandler.resolve(utilities_1.Global.base, url);
        // The check URL function checks the validity of the URL and whether it is a valid URL
        if (validUrl.isUri(new_url) === undefined) {
            utilities_1.Global.logger.log_strong_validation_error(`${new_url} is an invalid URL`);
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
 * @return - checked data (becomes the final value of `processed` in [[generate_internal_representation]] before returned to the caller). If a fatal error is raised, return null.
 */
function data_validation(data) {
    // Only those terms should be used which have a definition in the spec, others should be ignored
    const terms = utilities_1.get_terms(data);
    /* ============ The individual processing steps, following the spec ============== */
    /* Step: perform global data check. (That also includes value type checks.) */
    process_object_keys(data, (key) => {
        if (terms.is_regular_term(key)) {
            data[key] = global_data_checks(data, key, data[key]);
            if (data[key] === undefined) {
                delete data[key];
            }
        }
    });
    /* Step: profile extension point */
    data = utilities_1.Global.profile.data_validation(data);
    if (data === null)
        return null;
    /* Step: publication type */
    if (!data.type) {
        utilities_1.Global.logger.log_light_validation_error(`Missing publication type (set default)`);
        data.type = ["CreativeWork"];
    }
    /* Step: accessibility */
    if (data.accessModeSufficient) {
        data.accessModeSufficient = data.accessModeSufficient.filter((ams) => {
            const check_value = isMap(ams) && ams.type && ams.type === 'ItemList';
            if (!check_value) {
                utilities_1.Global.logger.log_strong_validation_error(`Value of "accessModeSufficient" is invalid`, ams);
            }
            return check_value;
        });
    }
    /* Step: identifier check; has been mostly done by virtue of checking the URL */
    if (data.id === undefined || data.id === '') {
        utilities_1.Global.logger.log_light_validation_error(`No id provided`);
        // This removes the '' string, if present
        delete data.id;
    }
    /* Step: duration check */
    if (data.duration) {
        if (!utilities_1.check_duration_value(data.duration, utilities_1.Global.logger)) {
            delete data.duration;
        }
    }
    /* Step: last modification date */
    if (data.dateModified) {
        if (!moment_1.default(data.dateModified, moment_1.default.ISO_8601).isValid()) {
            utilities_1.Global.logger.log_strong_validation_error(`"${data.dateModified}" is an incorrect date string`);
            delete data.dateModified;
        }
    }
    /* Step: Publication date */
    if (data.datePublished) {
        if (!moment_1.default(data.datePublished, moment_1.default.ISO_8601).isValid()) {
            utilities_1.Global.logger.log_strong_validation_error(`"${data.datePublished}" is an incorrect date string`);
            delete data.datePublished;
        }
    }
    /* Step: inLanguage */
    if (data.inLanguage) {
        data.inLanguage = data.inLanguage.filter((item) => {
            const check_result = utilities_1.check_language_tag(item, utilities_1.Global.logger);
            return check_result !== null && check_result !== undefined;
        });
    }
    /* Step: progression direction */
    if (data.readingProgression) {
        const check_result = utilities_1.check_direction_tag(data.readingProgression, utilities_1.Global.logger);
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
                utilities_1.Global.logger.log_strong_validation_error(`${link.url} appears in "links" but is within the bounds of the publication`);
                return false;
            }
            else {
                if (!link["rel"] || link["rel"].length === 0) {
                    utilities_1.Global.logger.log_light_validation_error(`Rel value in "links" not set`, link);
                }
                else {
                    const intersection = _.intersection(link["rel"], structural_resources);
                    if (intersection.length > 0) {
                        utilities_1.Global.logger.log_strong_validation_error(`Linked Resource in "links" includes "${intersection}"`, link);
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
                            utilities_1.Global.logger.log_light_validation_error(`Multiple definition for the structural resource "${str}"`, resource);
                        }
                        else {
                            flags[str] = true;
                            // For the 'cover' case, there is an extra check for an image
                            if (str === 'cover' && resource.encodingFormat && resource.encodingFormat.startsWith('image/') && !resource.name) {
                                utilities_1.Global.logger.log_light_validation_error(`No name provided for a cover page image`, resource);
                            }
                        }
                    }
                });
            }
        });
    }
    /* Step: run remove empty arrays */
    // Care should be taken to run this only on entries that are part of the definition of this object!
    // The previous step may have raised a fatal error, better check
    if (data !== undefined) {
        process_object_keys(data, (key) => {
            if (terms.is_valid_term(key)) {
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
        if (terms.is_regular_term(term)) {
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
        if (terms.is_strings_term(term)) {
            value = value.filter((item) => {
                if (!item.value) {
                    utilities_1.Global.logger.log_strong_validation_error(`Missing value for a Localizable String`, item);
                    return false;
                }
                if (item.language) {
                    const lang_check = utilities_1.check_language_tag(item.language, utilities_1.Global.logger);
                    if (lang_check === undefined || lang_check === null) {
                        delete item.language;
                    }
                }
                if (item.direction) {
                    const dir_check = utilities_1.check_direction_tag(item.direction, utilities_1.Global.logger);
                    if (dir_check === undefined || dir_check === null) {
                        delete item.direction;
                    }
                }
                return true;
            });
        }
        /* Step: an entity must have a name */
        if (terms.is_entities_term(term)) {
            value = value.filter((item) => {
                if (!item.name) {
                    utilities_1.Global.logger.log_strong_validation_error(`Missing name for a Person or Organization in "${term}"`, item);
                    return false;
                }
                else {
                    item.name = item.name.filter((name) => (name.value && name.value !== ''));
                    return true;
                }
            });
        }
        /* Step: check linked resources; it must have a url, and the value of length and alternate must be checked, too */
        if (terms.is_links_term(term)) {
            value = value.filter((resource) => {
                if (!resource.url) {
                    utilities_1.Global.logger.log_strong_validation_error(`URL is missing from a linked resource in "${term}"`, resource);
                    return false;
                }
                else {
                    if (validUrl.isUri(resource.url) === undefined) {
                        utilities_1.Global.logger.log_strong_validation_error(`"${resource.url}" is not a valid URL`);
                        return false;
                    }
                }
                if (resource.duration) {
                    if (!utilities_1.check_duration_value(resource.duration, utilities_1.Global.logger)) {
                        delete resource.duration;
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
        if (keys.is_literal_or_literals_term(key)) {
            return _.isString(val);
        }
        else if (keys.is_strings_term(key)) {
            return terms_1.isLocalizableString_Impl(val);
        }
        else if (keys.is_entities_term(key)) {
            return terms_1.isEntity_Impl(val);
        }
        else if (keys.is_links_term(key)) {
            return terms_1.isLinkedResource_Impl(val);
        }
        else if (keys.is_url_or_urls_term(key)) {
            return _.isString(val);
        }
        else if (keys.is_single_number_term(key)) {
            return _.isNumber(val);
        }
        else if (keys.is_single_boolean_term(key)) {
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
            utilities_1.Global.logger.log_strong_validation_error(`Type validation error for "${key}":`, value);
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
        process_object_keys(obj, (key) => {
            if (keys.is_valid_term(key)) {
                const check_result = verify_value_category(obj, key, obj[key]);
                if (!(check_result)) {
                    delete obj[key];
                }
            }
        });
        // Check if there is any meaningful term left!
        if (keys.all_terms.find((key) => Object.getOwnPropertyNames(obj).includes(key))) {
            return true;
        }
        else {
            return false;
        }
    };
    const terms = utilities_1.get_terms(context);
    if (terms.is_array_term(term)) {
        if (!(_.isArray(value))) {
            utilities_1.Global.logger.log_light_validation_error(`Value should be an array for "${term}"`, value);
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
                    utilities_1.Global.logger.log_strong_validation_error(`Empty array after value type check for "${term}"`);
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
    else if (terms.is_map_term(term)) {
        if (!(isMap(value))) {
            utilities_1.Global.logger.log_light_validation_error(`Value should be a map for "${term}"`, value);
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
            utilities_1.Global.logger.log_light_validation_error(`Duplicate value for ${link.url}`);
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
 * @returns - `null` if a fatal error has been raised, the original (albeit possibly modified) data otherwise.
 */
function add_default_values(data) {
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
        if (utilities_1.Global.document !== undefined) {
            const title = utilities_1.Global.document.querySelector('title');
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
                utilities_1.Global.logger.log_light_validation_error('No title element to set as a default "name"');
            }
        }
        else {
            ls = create_LocalizableString('*No Title*');
            utilities_1.Global.logger.log_light_validation_error('No "name" set and no default value');
        }
        data.name = [ls];
    }
    if (!data.readingOrder || data.readingOrder.length === 0) {
        if (utilities_1.Global.document !== undefined) {
            if (!utilities_1.Global.document.location.href) {
                utilities_1.Global.logger.log_fatal_error("Empty reading order, and no URL assigned to the HTML entry point to serve as default");
                return null;
            }
            else {
                data.readingOrder = [create_LinkedResource(utilities_1.Global.document.location.href)];
                if (!data.uniqueResources.includes(utilities_1.Global.document.location.href)) {
                    data.uniqueResources.push(utilities_1.Global.document.location.href);
                }
            }
        }
        else {
            utilities_1.Global.logger.log_fatal_error("Empty reading order");
            return null;
        }
    }
    /* Profile specific fallback */
    return utilities_1.Global.profile.add_default_values(data);
}
//# sourceMappingURL=process.js.map