import { PublicationManifest, LinkedResource, LocalizableString, CreatorInfo, TextDirection, ProgressionDirection } from './manifest';
import { CreatorInfo_Impl, LocalizableString_Impl, LinkedResource_Impl, PublicationManifest_Impl, Terms } from './manifest_classes';
import { LogLevel, Logger, toArray, convert_and_check_url, check_language_tag, check_direction_tag } from './utilities';
import * as url from 'url';

// ---------------------------- Global object for the various utilities ----------------

class Global  {
    static logger: Logger;
    static language: string = null;
    static direction: string = null;
    static base: string = '';
}

/* ****************** Conversion and checking methods, ie, to create specific classes, and check them at a later stage... ****************** */

// Literals ------------------
/**
 * Create a 'Literal'. This is a bit of an artificial method, because it turns all resources into a string, which should not happen...
 * So a warning is raised on that.
 *
 * @param arg the resource to be used as a string
 */
const create_string = (arg: any) : string  => {
    if(typeof arg === "string") {
        return arg;
    } else {
        const retval = `${arg}`;
        Global.logger.log(`${retval} should be a string, but it is not...`, LogLevel.warning);
        return `${arg}`;
    }
}

/**
 * Empty method, just to make the functional like mechanisms work properly...
 */
const check_string = (resource: string) : boolean => {
    return true;
}

// Linked resources ------------------
/**
 * Create a 'LinkedResource' instance.
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * @param arg either a string or an (originally JSON) object
 */
const create_LinkedResource = (resource: any) : LinkedResource => {
    const retval = new LinkedResource_Impl();
    if (typeof resource === "string") {
        retval._url = resource;
        retval._type = ["LinkedResource"];
    } else {
        convert_object(LinkedResource_Impl.terms, retval, resource);
        if (resource['length']) retval._length = resource['length'];
    }
    if (retval.url) retval._url = convert_and_check_url(retval.url, Global.base, Global.logger);
    return retval;
}

/**
 * Check a linked resource. If there is no URL, it is marked as an error, to be removed from the final result.
 *
 * @param resource the class to be checked
 * @returns true if the instance should be kept in the final output, false otherwise
 */
const check_LinkedResource = (resource: LinkedResource) : boolean => {
    let retval: boolean = true;

    // Check URL existence
    if (!resource.url) {
        Global.logger.log("Linked Resource without a url (removed)", LogLevel.error);
        return false;
    }

    // check media type format???
    // check number value

    return retval;
}

// Localizable strings
/**
 * Create a new Localizable String.
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * @param resource either a string or an (originally JSON) object
 */
const create_LocalizableString = (resource: any) : LocalizableString => {
    const retval = new LocalizableString_Impl();
    retval._type = ["LocalizableString"];
    if (typeof resource === "string") {
        retval._value = resource;
    } else {
        if (resource.value) {
            retval._value = resource.value;
        }
        if (resource.language) {
            retval._language = check_language_tag(resource.language, Global.logger);
        }
        if (resource.direction) {
            retval._direction = check_language_tag(resource.direction, Global.logger);
        }
    }

    // Set the language if not set...
    if (!retval.language && Global.language !== null) {
        retval._language = Global.language
    }
    if (!retval.direction && Global.language !== null) {
        retval._direction = Global.language
    }

    return retval;
}

/**
 * Check a localizable string. If there is no value, it is marked as an error, to be removed from the final result.
 *
 * @param resource the class to be checked
 * @returns true if the instance should be kept in the final output, false otherwise
 */
const check_LocalizableString = (resource: LocalizableString) : boolean => {
    let retval: boolean = true;
    if (!resource.value) {
        Global.logger.log("Localizable string without a value (removed)", LogLevel.error);
        retval = false;
    }
    return retval;
}

// Creators -------

/**
 * Create a new creator info, i.e., either a Person or an Organization.
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * @param resource either a string or a (originally JSON) object
 */
const create_CreatorInfo = (resource: any) : CreatorInfo => {
    const retval = new CreatorInfo_Impl();
    if (typeof resource === "string") {
        retval._name = [create_LocalizableString(resource)];
        retval._type = ["Person"];
    } else {
        if (resource['name']) {
            convert_object(CreatorInfo_Impl.terms, retval, resource);
            if (retval.url) retval._url = convert_and_check_url(retval.url, Global.base, Global.logger);
        }
    }
    return retval;
}

/**
 * Check a creator information. If there is no name, it is marked as an error, to be removed from the final result.
 *
 * @param resource the class to be checked
 * @returns true if the instance should be kept in the final output, false otherwise
 */
const check_CreatorInfo = (resource: CreatorInfo) : boolean => {
    let retval: boolean = true;
    if (!resource.name) {
        Global.logger.log("Creator without a name (removed)", LogLevel.error);
        retval = false;
    }
    return retval;
}

/**
 * Check the top level object instance
 */
const check_PublicationManifest = (manifest: PublicationManifest_Impl): PublicationManifest => {
    const empty = new PublicationManifest_Impl();
    if (manifest.name.length === 0) {
        Global.logger.log("Name (title) is missing for the manifest", LogLevel.error);
        return empty;
    }

    if (manifest.readingOrder.length === 0) {
        Global.logger.log("Default reading order is missing for the manifest", LogLevel.error);
        return empty;
    }

    if (manifest.type.length === 0) {
        Global.logger.log("Type information is missing for the manifest", LogLevel.warning);
        manifest._type = ['CreativeWork'];
    }

    if (manifest.url) manifest._url = manifest.url.map((a_url) :string => convert_and_check_url(a_url, Global.base, Global.logger));
    if (manifest.inLanguage) manifest._inLanguage = manifest.inLanguage.map((lang) :string => check_language_tag(lang, Global.logger));

    // check dates for date published and updated

    if (manifest.readingProgression) {
        if (!(manifest.readingProgression === ProgressionDirection.rtl || manifest.readingProgression === ProgressionDirection.ltr)) {
            Global.logger.log(`readingProgression value ('${manifest.readingProgression}') is invalid`, LogLevel.warning);
            manifest['_readingProgression'] = ProgressionDirection.rtl;
        }
    }
    if (manifest.direction) {
        if (!(manifest.direction === TextDirection.rtl || manifest.direction === TextDirection.ltr || manifest.direction === TextDirection.auto)) {
            Global.logger.log(`direction value ('${manifest.direction}') is invalid`, LogLevel.warning);
        }
    }

    return manifest;
}

/* **************************** General utility create an array of class instances **************************** */

/**
 * Callback interface to create a class of a specific type
 */
interface create_Instance<T> {
    (arg: any): T;
}

/**
 * Callback interface to check the validity of a class instance
 */
interface check_Instance<T> {
    (arg: T): boolean;
}
/**
 * Generic utility to create an array of object of a specific type
 * @param arg The original data from JSON: either a string, or an array of strings and objects
 * @param creator The method to create a bona fide typed class from a string or a (generic) object
 * @param checker Check the class instance for validity; in some cases this may result in removing it
 */
function get_ObjectArray<T>(arg: any, creator: create_Instance<T>, checker: check_Instance<T>) : T[] {
    return toArray(arg)
            .map( (val: any) :T => creator(val) )
            .filter( (value: T): boolean => checker(value) );
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
function convert_object(terms: Terms, target: PublicationManifest_Impl | LinkedResource_Impl | CreatorInfo_Impl, source: any) {
    // Some terms should just be copied
    terms.single_literal_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = create_string(source[term]);
    })

    // Some terms should be arrays, but otherwise their value remains unchanged
    terms.multiple_literal_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<string>(source[term], create_string, check_string);
    })

    // Some terms should be converted into a single Localizable String
    terms.single_loc_string_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = create_LocalizableString(source[term]);
    })

    // Some terms should be converted into an array of Localizable Strings
    terms.multiple_loc_string_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<LocalizableString>(source[term], create_LocalizableString, check_LocalizableString);
    })

    // Some terms should be converted into an array of entities
    terms.multiple_creators_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<CreatorInfo>(source[term], create_CreatorInfo, check_CreatorInfo);
    })

    terms.multiple_link_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<LinkedResource>(source[term], create_LinkedResource, check_LinkedResource);
    })
}

/* **************************** Top level entry point **************************** */

/**
 * _The_ entry point to the conversion.
 *
 * @param manifest the manifest string; supposed to be a string parsable as JSON
 * @param logger generic logger instance to log warnings and errors during processing
 * @returns a bona fide `PublicationManifest` instance
 */

export function process_manifest(manifest: string, base: string, logger: Logger) : PublicationManifest {
    const retval = new PublicationManifest_Impl();
    let obj;
    Global.logger = logger;
    Global.base = base;

    // Separate the JSON parsing errors...
    try {
        obj = JSON.parse(manifest);
    } catch (err) {
        logger.log(`JSON parsing error: ${err.message}`, LogLevel.error);
        return retval;
    }

    // Work through the context in a separate part
    if (obj["@context"]) {
        // To simplify, turn this into an array in any case
        const contexts = toArray(obj["@context"]);
        if ( contexts.length >= 2 && (contexts[0] === "http://schema.org" || contexts[0] === "https://schema.org") && contexts[1] === "https://www.w3.org/ns/pub-context" ) {
            // check languages and directions
            contexts.slice(2).forEach( (context) => {
                try {
                    Global.language = check_language_tag(context["language"], Global.logger);
                } catch(e) {
                    // no problem if that did not work; no language has been set
                    ;
                }
                try {
                    Global.direction = check_direction_tag(context["direction"], Global.logger);
                } catch(e) {
                    // no problem if that did not work; no language has been set
                    ;
                }
            });
        } else {
            Global.logger.log("@context values are not set as required", LogLevel.error);
        }
    } else {
        Global.logger.log("No @context set in manifest", LogLevel.error);
    }

    if (Global.logger.errors.length > 0) return retval;

    try {
        convert_object(PublicationManifest_Impl.terms, retval, obj);
    } catch( err ) {
        logger.log(`${err.message}`, LogLevel.error);
    }
    return check_PublicationManifest(retval);
}
