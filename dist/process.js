"use strict";
/**
 * Implementation (with minor omission, see comments) of the Processing steps as define in
 * [§4 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#manifest-processing).
 *
 * Note, however, that the HTML related functions (e.g., extracting `<title>`) is _not_ implemented
 * at this point.
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
/* ===================================================================================================
  The interfaces defining the manifest interfaces. This is what the external world should
  'see' in the return value, i.e., _processed_
 ===================================================================================================== */
const manifest_1 = require("./manifest");
/* ===================================================================================================
 The implementations for the official interfaces, i.e., the bona fide classes
 ===================================================================================================== */
const manifest_classes_1 = require("./manifest_classes");
/* ====================================================================================================
 Various utilities
 ====================================================================================================== */
const utilities_1 = require("./utilities");
const url = __importStar(require("url"));
/* ====================================================================================================
 Global objects and constants
 ====================================================================================================== */
/**
 * The URL of the 'default' profile for the conformance.
 * (This still has to stabilize in the spec)
 */
const default_profile = 'https://www.w3.org/TR/pub-manifest/';
const known_profiles = [default_profile, 'https://www.w3.org/TR/audiobooks/'];
/**
 * "Global" object; these values help in streamlining some of the functions
 */
class Global {
}
Global.lang = '';
Global.dir = '';
Global.base = '';
Global.profile = '';
/* Minor utilities */
/**
 * Get the Terms object assigned to a specific resource. See the definition of Terms for details.
 *
 * @param resource
 * @returns instance of Terms
 */
const get_terms = (resource) => {
    if (resource instanceof manifest_classes_1.PublicationManifest_Impl || resource instanceof manifest_classes_1.Entity_Impl ||
        resource instanceof manifest_classes_1.LinkedResource_Impl || resource instanceof manifest_classes_1.LocalizableString_Impl) {
        return resource.terms;
    }
    else {
        return undefined;
    }
};
/**
 * Shorthand to check whether the object is a map that is used recursively for further checks.
 *
 * @param obj
 */
const recognized_type = (obj) => utilities_1.isMap(obj) && (obj instanceof manifest_classes_1.Entity_Impl || obj instanceof manifest_classes_1.LinkedResource_Impl);
/* ====================================================================================================
 Direct utility functions in the processing steps

 (Factored out for a better readability)
====================================================================================================== */
/**
 * Create a new entity, i.e., either a Person or an Organization.
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * This is used for the implementation of step §4.3.1/3.
 *
 * @param resource either a string or a (originally JSON) object
 */
const create_Entity = (resource) => {
    if (resource === null || utilities_1.isBoolean(resource) || utilities_1.isNumber(resource) || utilities_1.isArray(resource)) {
        Global.logger.log_validation_error(`Invalid entity`, resource, true);
        return undefined;
    }
    else if (utilities_1.isString(resource)) {
        const new_entity = new manifest_classes_1.Person_Impl();
        new_entity.name = resource;
        new_entity.type = ["Person"];
        return new_entity;
    }
    else if (utilities_1.isMap(resource)) {
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
        return undefined;
        // Actually, returning undefined is a default action when no 'return' is present
        // but it is cleaner to make this explicit
    }
};
/**
 * Create a new localizable string
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * This is used for the implementation of step §4.3.1/4.
 *
 * @param resource either a string or a (originally JSON) object
 */
const create_LocalizableString = (resource) => {
    if (resource === null || utilities_1.isBoolean(resource) || utilities_1.isNumber(resource) || utilities_1.isArray(resource)) {
        Global.logger.log_validation_error(`Invalid localizable string`, resource, true);
        return undefined;
    }
    else if (utilities_1.isString(resource)) {
        const new_ls = new manifest_classes_1.LocalizableString_Impl();
        new_ls.value = resource;
        if (Global.lang !== '') {
            new_ls.language = Global.lang;
        }
        if (Global.dir !== '') {
            new_ls.direction = Global.dir;
        }
        return new_ls;
    }
    else if (utilities_1.isMap(resource)) {
        const new_ls = new manifest_classes_1.LocalizableString_Impl();
        utilities_1.copy_object(resource, new_ls);
        if (new_ls.language) {
            if (new_ls.language === null)
                delete new_ls.language;
        }
        else if (Global.lang !== '') {
            new_ls.language = Global.lang;
        }
        if (new_ls.direction) {
            if (new_ls.direction === null)
                delete new_ls.direction;
        }
        else if (Global.dir !== '') {
            new_ls.direction = Global.dir;
        }
        return new_ls;
    }
    else {
        // I am not sure this would occur at all but, just to be on the safe side...
        return undefined;
        // Actually, returning undefined is a default action when no 'return' is present
        // but it is cleaner to make this explicit
    }
};
/**
 * Create a new Linked Resource
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * This is used for the implementation of step §4.3.1/5.
 *
 * @param resource either a string or a (originally JSON) object
 */
const create_LinkedResource = (resource) => {
    if (resource === null || utilities_1.isBoolean(resource) || utilities_1.isNumber(resource) || utilities_1.isArray(resource)) {
        Global.logger.log_validation_error(`Invalid Linked Resource`, resource, true);
        return undefined;
    }
    else if (utilities_1.isString(resource)) {
        const new_lr = new manifest_classes_1.LinkedResource_Impl();
        new_lr.url = resource;
        new_lr.type = ['LinkedResource'];
        return new_lr;
    }
    else if (utilities_1.isMap(resource)) {
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
        return undefined;
        // Actually, returning undefined is a default action when no 'return' is present
        // but it is cleaner to make this explicit
    }
};
/* ====================================================================================================
 The main processing steps, following the spec

 Note that two aspects have not (yet) been implemented

 - extracting default values from HTML
 - extension points

 The details of these are not really important in testing the spec...
====================================================================================================== */
/**
 * Process the manifest. This corresponds to the main body of
 * [§4.3 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#processing-algorithm).
 *
 * Note, however, that this function does a little bit more. Whereas the official processing steps
 * start with the json _text_, and delegates the access to this to a profile, this function shortcuts this,
 * and starts with the URL of the JSON file. Because the goal of all this is checking the processing algorithm,
 * there is no implementation of the extraction from an HTML file, etc.
 *
 * The check of the media types for step (3) (for the conformance test) is also not done. The details are not really relevant for
 * this testing implementations, the profile value is set to a default generic value.
 *
 * Local specificity: when the document says 'failure is returned', this appears in the code as returning the
 * Javascript value 'undefined'.
 *
 * @async
 * @param url: address of the JSON file
 * @param base: base URL; if undefined or empty, fall back on the value of url
 * @param logger: an extra parameter to collect the error and warning messages
 * @return the processed manifest
 */
function generate_representation(url, base, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        Global.logger = logger;
        // In the real world the value of base must be checked against invalid or malicious URL-s!
        // The reuse of the url as a base is not specified in the standard, and is here simply to
        // make testing easier. If the code is reused in real, this may have to be modified
        Global.base = (base === undefined || base === '') ? url : base;
        /* ============ The individual processing steps, following the spec ============== */
        /* Step: create the, initially empty, processed manifest */
        let processed = new manifest_classes_1.PublicationManifest_Impl();
        /* Step: get the manifest. This step does more than just parsing; it retrieves the content via the URL */
        let manifest;
        // retrieve the manifest and convert it into
        try {
            manifest = yield utilities_1.fetch_json(url);
        }
        catch (err) {
            logger.log_fatal_error(`JSON fetching or parsing error: ${err.message}`, null, true);
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
            Global.profile = default_profile;
        }
        else {
            const conforms = utilities_1.toArray(manifest.conformsTo);
            const acceptable_values = conforms.filter((value) => known_profiles.includes(value));
            if (acceptable_values.length === 0) {
                // No acceptable values were detected for the profile
                // At this point, the UA should inspect the media types and make a best guess.
                // This is not implemented, and the result of this test is supposed to be true...
                logger.log_validation_error(`No known conformance was set (falling back to default)`);
                Global.profile = default_profile;
                // If the non implemented test resulted in false, a Fatal Error should be added here:
                // logger.log_fatal_error(`Couldn't establish any acceptable profile`);
                // return {} as PublicationManifest
            }
            else {
                Global.profile = conforms[0];
            }
        }
        processed.profile = Global.profile;
        /* Step: global declarations, ie, extract the global language and direction settings if any */
        {
            let lang = '';
            let dir = '';
            for (let i = contexts.length - 1; i >= 0; i--) {
                if (typeof contexts[i] === 'object') {
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
                    Global.lang = lang;
                }
                else {
                    // error message is generated in the check_language_tag function;
                }
            }
            if (dir !== '') {
                if (utilities_1.check_direction_tag(dir, logger)) {
                    Global.dir = dir;
                }
                else {
                    // error message is generated in the check_direction_tag function;
                }
            }
        }
        /* Step: go (recursively!) through all the term in manifest, normalize the value, an set it in processed */
        Object.getOwnPropertyNames(manifest).forEach((term) => {
            const value = manifest[term];
            const normalized = normalize_data(processed, term, value);
            if (normalized !== undefined) {
                processed[term] = normalized;
            }
        });
        /* Step: Data validation */
        processed = data_validation(processed);
        /* Step: HTML defaults (not implemented)  */
        /* Step: return processed */
        return processed;
    });
}
exports.generate_representation = generate_representation;
/**
 *
 * Normalize Data. This corresponds to the main body of
 * [§4.3.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#normalize-data).
 *
 * @param context 'context', in this case the object that has invoked the function
 * @param term property term
 * @param value property value
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
        if (recognized_type(item)) {
            Object.getOwnPropertyNames(item).forEach((key) => {
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
    const terms = get_terms(context);
    // console.log(`\n@@@@ ${JSON.stringify(terms)}`)
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
        if (terms.array_terms.includes(term) && (utilities_1.isString(value) || utilities_1.isBoolean(value) || utilities_1.isNumber(value) || utilities_1.isMap(value) || value === null)) {
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
            // Note that the conversion function may return undefined, which is then forwarded back to the caller
            normalized = convert_to_absolute_URL(value);
        }
        /* Step b: create an array of absolute URLs from a strings */
        if (terms.array_of_urls.includes(term)) {
            normalized = normalized.map(convert_to_absolute_URL).filter((entity) => entity !== undefined);
        }
    }
    /* Step: extension point (not implemented) */
    /* Step: recursively normalize the values of normalize */
    // A previous step may have set an undefined value, this has to be ignored, again just to be on the safe side
    if (normalized !== undefined) {
        if (utilities_1.isArray(normalized)) {
            // Go through each entry, normalize, and remove any undefined value
            normalized = normalized.map((item) => (utilities_1.isMap(item) ? normalize_map(item) : item)).filter((item) => item !== undefined);
        }
        else if (utilities_1.isMap(normalized)) {
            normalized = normalize_map(normalized);
        }
    }
    return normalized;
}
/**
 * Create a new absolute URL
 *
 * This is used for the implementation of step §4.3.1/5.
  * [§4.3.1.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#convert-absolute-url).
*
 * @param resource either a string or a (originally JSON) object
 */
const convert_to_absolute_URL = (resource) => {
    if (!utilities_1.isString(Global.base) || Global.base === '' || Global.base === null) {
        Global.logger.log_validation_error(`Invalid base ${Global.base}`, null, true);
        return undefined;
    }
    if (!utilities_1.isString(resource) || resource === '' || resource === null) {
        Global.logger.log_validation_error(`Invalid relative URL ${resource}`, null, true);
        return undefined;
    }
    else {
        const new_url = url.resolve(Global.base, resource);
        // The check URL function checks the validity of the URL and whether it is a Web URL
        return utilities_1.check_url(new_url, Global.logger) ? new_url : undefined;
    }
};
/**
 *
 * Data Validation. This corresponds to the main body of
 * [§4.3.2 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#validate-data).
 *
 * @param data the data to be checked
 * @return checked data (the final value of processed)
 */
function data_validation(data) {
    // Only those terms should be used which have a definition in the spec, others should be ignored
    const defined_terms = get_terms(data).array_terms;
    /* ============ The individual processing steps, following the spec ============== */
    /* Step: perform global data check. (That also includes value type checks.) */
    Object.getOwnPropertyNames(data).forEach((key) => {
        if (defined_terms.includes(key)) {
            data[key] = global_data_checks(data, key, data[key]);
            if (data[key] === undefined) {
                delete data[key];
            }
        }
    });
    /* Step: publication type */
    if (!data.type) {
        Global.logger.log_validation_error(`Missing publication type (set default)`);
        data.type = ["CreativeWork"];
    }
    /* Step: accessibility */
    if (data.accessModeSufficient) {
        data.accessModeSufficient = data.accessModeSufficient.filter((ams) => {
            return utilities_1.isMap(ams) && ams.type && ams.type === 'ItemList';
        });
    }
    /* Step: identifier check */
    if (!(data.id && utilities_1.isString(data.id) && data.id !== '')) {
        Global.logger.log_validation_error(`Missing or invalid identifier`, data.id);
    }
    /* Step: duration check */
    if (data.duration) {
        // check the value and remove if wrong
    }
    /* Step: last modification date */
    if (data.dateModified) {
        // check the value and remove if wrong
    }
    /* Step: Publication date */
    if (data.datePublished) {
        // check the value and remove if wrong
    }
    /* Step: inLanguage */
    if (data.inLanguage) {
        data.inLanguage = data.inLanguage.filter((item) => {
            const check_result = utilities_1.check_language_tag(item, Global.logger);
            return check_result !== null && check_result !== undefined;
        });
    }
    /* Step: progression direction */
    if (data.readingProgression) {
        const check_result = utilities_1.check_direction_tag(data.readingProgression, Global.logger);
        if (check_result === undefined)
            data.readingProgression = manifest_1.ProgressionDirection.ltr;
    }
    else {
        data.readingProgression = manifest_1.ProgressionDirection.ltr;
    }
    /* Step: profile extension point (not implemented) */
    /* Step: run remove empty arrays */
    // Care should be taken to run this only on entries that are part of the definition of this object!
    Object.getOwnPropertyNames(data).forEach((key) => {
        if (defined_terms.includes(key)) {
            if (!(remove_empty_arrays(data[key]))) {
                delete data[key];
            }
        }
    });
    return data;
}
/**
 *
 * Global Data Check. This corresponds to the main body of
 * [§4.4.2.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#global-data-checks).
 *
 * @param context 'context', in this case the object that has invoked the function
 * @param term property term
 * @param value property value
 * @return the normalized value or undefined, in case of error
 */
function global_data_checks(context, term, value) {
    const terms = get_terms(context);
    if (terms) {
        /* Step: see if the term has a known value category and check that value. */
        // "known value category" means, in this case, that the term is known for the specific context
        if (terms.all_terms.includes(term)) {
            if (verify_value_category(context, term, value) === false) {
                return undefined;
            }
        }
        /* Step: recursively to do data check at this point! */
        {
            const map_data_check = (item) => {
                if (recognized_type(item)) {
                    // Check that the key is defined!!! Maybe using _.intersection?
                    Object.getOwnPropertyNames(item).forEach((key) => {
                        const keyValue = item[key];
                        item[key] = global_data_checks(item, key, keyValue);
                        if (item[key] === undefined) {
                            delete item[key];
                        }
                    });
                }
                return item;
            };
            if (utilities_1.isMap(value)) {
                map_data_check(value);
            }
            else if (utilities_1.isArray(value)) {
                value = value.map(map_data_check);
            }
        }
        /* Step: check the value of language and direction, possibly removing the value */
        if (terms.array_of_strings.includes(term)) {
            value = value.filter((item) => {
                if (!item.value) {
                    Global.logger.log_validation_error(`Missing value for a Localizable String`, item, true);
                    return false;
                }
                if (item.language) {
                    const lang_check = utilities_1.check_language_tag(item.language, Global.logger);
                    if (lang_check === undefined || lang_check === null) {
                        delete item.language;
                    }
                }
                if (item.direction) {
                    const dir_check = utilities_1.check_direction_tag(item.direction, Global.logger);
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
                    Global.logger.log_validation_error(`Missing name for a Person or Organization in "${term}"`, item, true);
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
                    Global.logger.log_validation_error(`URL is missing from a linked resource in "${term}"`, resource, true);
                    return false;
                }
                else if (!utilities_1.check_url(resource.url, Global.logger)) {
                    Global.logger.log_validation_error(`${resource.url} is is not a valid URL`, null, true);
                    return false;
                }
                if (resource.length) {
                    if (!(utilities_1.isNumber(resource.length) && resource.length >= 0)) {
                        Global.logger.log_validation_error(`Linked Resource length is is invalid in  "${term}"`, resource, true);
                        return false;
                    }
                }
                if (resource.alternate) {
                    resource.alternate.forEach((alternate) => {
                        if (!alternate.encodingFormat) {
                            Global.logger.log_validation_error(`Alternate does not have an encoding format set`);
                        }
                    });
                }
                return true;
            });
        }
    }
    return value;
}
/**
 *
 * Global Data Check. This corresponds to the main body of
 * [§4.4.2.2 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#verify-value-category).
 *
 * @param context 'context', in this case the object that has invoked the function
 * @param term property term
 * @param value property value
 * @return true or false, depending on whether the value category check is successful or not
 */
function verify_value_category(context, term, value) {
    const check_expected_type = (keys, key, obj) => {
        if (keys.array_or_single_literals.includes(key)) {
            return utilities_1.isString(obj);
        }
        else if (keys.array_of_strings.includes(key)) {
            return obj instanceof manifest_classes_1.LocalizableString_Impl;
        }
        else if (keys.array_of_entities.includes(key)) {
            return obj instanceof manifest_classes_1.Entity_Impl;
        }
        else if (keys.array_of_links.includes(key)) {
            return obj instanceof manifest_classes_1.LinkedResource_Impl;
        }
        else if (keys.array_or_single_urls.includes(key)) {
            return utilities_1.isString(obj);
        }
        else if (keys.single_number.includes(key)) {
            return utilities_1.isNumber(obj);
        }
        else if (keys.single_boolean.includes(key)) {
            return utilities_1.isBoolean(obj);
        }
        else {
            // No constraint defined
            return true;
        }
    };
    const check_expected_type_and_report = (keys, key, obj) => {
        const check_result = check_expected_type(keys, key, obj);
        if (!check_result) {
            Global.logger.log_validation_error(`Type validation error for "${key}":`, value, true);
        }
        return check_result;
    };
    const verify_map = (obj) => {
        const keys = get_terms(obj);
        const defined_terms = keys.all_terms;
        Object.getOwnPropertyNames(obj).forEach((key) => {
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
    const terms = get_terms(context);
    if (terms.array_terms.includes(term)) {
        if (!(utilities_1.isArray(value))) {
            Global.logger.log_validation_error(`Value should be an array for "${term}"`, value);
            return false;
        }
        else {
            value = value.map((item) => {
                if (check_expected_type_and_report(terms, term, item)) {
                    return utilities_1.isMap(item) ? verify_map(item) : item;
                }
                else {
                    // wrong type
                    return false;
                }
            }).filter((item) => item !== undefined);
            if (value.length === 0) {
                Global.logger.log_validation_error(`Empty array after value type check for "${term}"`, null, true);
                return false;
            }
            else {
                return true;
            }
        }
    }
    else if (terms.maps.includes(term)) {
        if (!(utilities_1.isMap(value))) {
            Global.logger.log_validation_error(`Value should be a map for "${term}"`, value);
            return false;
        }
        else {
            return verify_map(value);
        }
    }
    return check_expected_type(terms, term, value);
}
/**
 *
 * Remove empty arrays, and remove empty arrays from maps. This corresponds to the main body of
 * [§4.3.2.3 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#remove-empty-arrays).
 *
 * @param data the data to be checked
 * @return false if the array is empty, true otherwise
 */
function remove_empty_arrays(value) {
    if (utilities_1.isArray(value) && value.length === 0) {
        return false;
    }
    else if (utilities_1.isMap(value)) {
        Object.getOwnPropertyNames(value).forEach((key) => {
            const keyValue = value[key];
            if (!remove_empty_arrays(keyValue)) {
                delete value[key];
            }
        });
    }
    return true;
}
//# sourceMappingURL=process.js.map