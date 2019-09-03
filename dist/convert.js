"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_classes_1 = require("./manifest_classes");
const utilities_1 = require("./utilities");
// ---------------------------- Global object for the various utilities ----------------
class Global {
}
Global.language = '';
Global.base = '';
/* **************************** Conversion and checking methods, ie, to create specific classes, and check them at a later stage... **************************** */
// Literals ------------------
/**
 * Create a 'Literal'. This is a bit of an artificial method, because it turns all resources into a string, which should not happen...
 * So a warning is raised on that.
 *
 * @param arg the resource to be used as a string
 */
const create_string = (arg) => {
    if (typeof arg === "string") {
        return arg;
    }
    else {
        const retval = `${arg}`;
        Global.logger.log(`${retval} should be a string, but it is not...`, utilities_1.LogLevel.warning);
        return `${arg}`;
    }
};
/**
 * Empty method, just to make the functional like mechanisms work properly...
 */
const check_string = (resource) => {
    return true;
};
// Linked resources ------------------
/**
 * Create a 'LinkedResource' instance.
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * @param arg either a string or an (originally JSON) object
 */
const create_LinkedResource = (resource) => {
    const retval = new manifest_classes_1.LinkedResource_Impl();
    if (typeof resource === "string") {
        retval._url = resource;
        retval._type = ["LinkedResource"];
    }
    else {
        convert_object(manifest_classes_1.LinkedResource_Impl.terms, retval, resource);
    }
    return retval;
};
/**
 * Check a linked resource. If there is no URL, it is marked as an error, to be removed from the final result.
 *
 * @param resource the class to be checked
 * @returns true if the instance should be kept in the final output, false otherwise
 */
const check_LinkedResource = (resource) => {
    let retval = true;
    if (!resource.url) {
        Global.logger.log("Linked Resource without a url (removed)", utilities_1.LogLevel.error);
        retval = false;
    }
    return retval;
};
// Localizable strings
/**
 * Create a new Localizable String.
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * @param resource either a string or an (originally JSON) object
 */
const create_LocalizableString = (resource) => {
    const retval = new manifest_classes_1.LocalizableString_Impl();
    retval._type = ["LocalizableString"];
    if (typeof resource === "string") {
        retval._value = resource;
    }
    else {
        if (resource.value) {
            retval._value = resource.value;
        }
        if (resource.language) {
            retval._language = resource.language;
        }
    }
    // Set the language if not set...
    if (!retval.language && Global.language) {
        retval._language = Global.language;
    }
    return retval;
};
/**
 * Check a localizable string. If there is no value, it is marked as an error, to be removed from the final result.
 *
 * @param resource the class to be checked
 * @returns true if the instance should be kept in the final output, false otherwise
 */
const check_LocalizableString = (resource) => {
    let retval = true;
    if (!resource.value) {
        Global.logger.log("Localizable string without a value (removed)", utilities_1.LogLevel.error);
        retval = false;
    }
    return retval;
};
// Creators -------
/**
 * Create a new creator info, i.e., either a Person or an Organization.
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * @param resource either a string or a (originally JSON) object
 */
const create_CreatorInfo = (resource) => {
    const retval = new manifest_classes_1.CreatorInfo_Impl();
    if (typeof resource === "string") {
        retval._name = [create_LocalizableString(resource)];
        retval._type = ["Person"];
    }
    else {
        if (resource['name']) {
            convert_object(manifest_classes_1.CreatorInfo_Impl.terms, retval, resource);
            // this one is special
            if (resource['length'])
                retval['_length'] = resource['length'];
        }
    }
    return retval;
};
/**
 * Check a creator information. If there is no name, it is marked as an error, to be removed from the final result.
 *
 * @param resource the class to be checked
 * @returns true if the instance should be kept in the final output, false otherwise
 */
const check_CreatorInfo = (resource) => {
    let retval = true;
    if (!resource.name) {
        Global.logger.log("Creator without a name (removed)", utilities_1.LogLevel.error);
        retval = false;
    }
    return retval;
};
/**
 * Generic utility to create an array of object of a specific type
 * @param arg The original data from JSON: either a string, or an array of strings and objects
 * @param creator The method to create a bona fide typed class from a string or a (generic) object
 * @param checker Check the class instance for validity; in some cases this may result in removing it
 */
function get_ObjectArray(arg, creator, checker) {
    return utilities_1.toArray(arg)
        .map((val) => creator(val))
        .filter((value) => checker(value));
}
/* **************************** Top level generator function for the content of an instance **************************** */
/**
 * Generic tool to convert a (originally JSON) object into a class. It consider all the predefined terms and,
 * if they appear in the `source`, they are transformed into direct values, arrays of Localizable Strings, Entities, strings, etc,
 * depending of the value type assigned to the term by the Pub Manifest specification. The converted, and properly typed, instances
 * are then added as bona fide terms to `target`
 *
 * @param terms categorization of property names; each variable in `terms` is an array of term names
 * @param target the class where the values should be put
 * @param source the (originally JSON) object to get the values from
 */
function convert_object(terms, target, source) {
    // Some terms should just be copied
    terms.single_literal_terms.forEach((term) => {
        if (source[term])
            target[`_${term}`] = create_string(source[term]);
    });
    // Some terms should be arrays, but otherwise their value remains unchanged
    terms.multiple_literal_terms.forEach((term) => {
        if (source[term])
            target[`_${term}`] = get_ObjectArray(source[term], create_string, check_string);
    });
    // Some terms should be converted into a single Localizable String
    terms.single_loc_string_terms.forEach((term) => {
        if (source[term])
            target[`_${term}`] = create_LocalizableString(source[term]);
    });
    // Some terms should be converted into an array of Localizable Strings
    terms.multiple_loc_string_terms.forEach((term) => {
        if (source[term])
            target[`_${term}`] = get_ObjectArray(source[term], create_LocalizableString, check_LocalizableString);
    });
    // Some terms should be converted into an array of entities
    terms.multiple_creators_terms.forEach((term) => {
        if (source[term])
            target[`_${term}`] = get_ObjectArray(source[term], create_CreatorInfo, check_CreatorInfo);
    });
    terms.multiple_link_terms.forEach((term) => {
        if (source[term])
            target[`_${term}`] = get_ObjectArray(source[term], create_LinkedResource, check_LinkedResource);
    });
}
/* **************************** Top level entry point **************************** */
/**
 * _The_ entry point to the conversion.
 *
 * @param manifest the manifest string; supposed to be a string parsable as JSON
 * @param logger generic logger instance to log warnings and errors during processing
 * @returns a bona fide `PublicationManifest` instance
 */
function process_manifest(manifest, logger) {
    const retval = new manifest_classes_1.PublicationManifest_Impl();
    let obj;
    Global.logger = logger;
    // Separate the JSON parsing errors...
    try {
        obj = JSON.parse(manifest);
    }
    catch (err) {
        logger.log(`JSON parsing error: ${err.message}`, utilities_1.LogLevel.error);
        return retval;
    }
    // Work through the context in a separate part
    if (obj["@context"]) {
        // To simplify, turn this into an array in any case
        const contexts = utilities_1.toArray(obj["@context"]);
        if (contexts.length >= 2 && (contexts[0] === "http://schema.org" || contexts[0] === "https://schema.org") && contexts[1] === "https://www.w3.org/ns/pub-context") {
            // check language
            try {
                Global.language = contexts[2]["language"];
            }
            catch (e) {
                // no problem if that did not work; no language has been set
                ;
            }
        }
        else {
            Global.logger.log("@context values are not set as required", utilities_1.LogLevel.error);
        }
    }
    else {
        Global.logger.log("No @context set in manifest", utilities_1.LogLevel.error);
    }
    if (Global.logger.errors.length > 0)
        return retval;
    try {
        convert_object(manifest_classes_1.PublicationManifest_Impl.terms, retval, obj);
    }
    catch (err) {
        logger.log(`${err.message}`, utilities_1.LogLevel.error);
    }
    return retval;
}
exports.process_manifest = process_manifest;
