import { PublicationManifest, LinkedResource, LocalizableString, Entity, ProgressionDirection } from './manifest';
import { Entity_Impl, LocalizableString_Impl, LinkedResource_Impl, PublicationManifest_Impl, Terms, URL } from './manifest_classes';
import { LogLevel, Logger, toArray, check_url, check_language_tag, check_direction_tag, isNumber, fetch_json } from './utilities';
import * as url from 'url';

const accepted_profile = 'http://www.w3.org/TR/audiobooks';

// ---------------------------- Global object for the various utilities ----------------

class Global  {
    static logger: Logger;
    static language: string = undefined;
    static direction: string = undefined;
    static base: string = '';
    static profile: string = '';
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
        Global.logger.log(`${retval} should be a string, but it is not...`, LogLevel.ValidationError);
        return `${arg}`;
    }
}

/**
 * Empty method, just to make the functional like mechanisms work properly...
 */
const check_string = (resource: string) : boolean => {
    return true;
}

/**
 * Create an absolute URL
 *
 * @param resource absolute URL
 * @returns absolute URL
 */
const create_URL = (resource: any): URL => {
    if (typeof resource !== 'string') {
        Global.logger.log(`'${resource}' is an invalid Web URL`, LogLevel.ValidationError);
        return '';
    } else {
        return url.resolve(Global.base, resource)
    }
}

/**
 * Check whether a URL is indeed a Web URL
 *
 * @param resource URL value
 * @returns boolean
 */
const check_Web_URL = (resource: URL): boolean => {
    return check_url(resource, Global.logger, LogLevel.ValidationError);
}

// Linked resources ------------------
/**
 * Create a 'LinkedResource' instance.
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * @param arg either a string or an (originally JSON) object
 */
const create_LinkedResource = (resource: any): LinkedResource => {
    const retval = new LinkedResource_Impl();
    if (typeof resource === "string") {
        retval.url = resource;
    } else {
        normalize(LinkedResource_Impl.terms, retval, resource);
        if (resource['length']) retval.length = resource['length'];
    }
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
        Global.logger.log("Linked Resource without a url (removed)", LogLevel.FatalError);
        return false;
    }
    // check media type format???
    if (resource.length && !(isNumber(resource.length))) {
        Global.logger.log(`Linked Resource length is not a number (${resource.length})`, LogLevel.ValidationError);
    }

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
    let lang = (Global.language !== undefined) ? Global.language : undefined;
    let dir  = (Global.direction !== undefined) ? Global.direction : undefined;

    if (typeof resource === 'number' || typeof resource === 'boolean' || resource === null) {
        Global.logger.log(`Invalid value for a Localizable String: ${resource}`, LogLevel.ValidationError);
        return {} as LocalizableString;
    } else if (typeof resource === "string") {
        retval.value = resource;
    } else {
        if (resource.value) {
            retval.value = resource.value;
        }
        if (resource.language !== undefined) {
            lang = check_language_tag(resource.language, Global.logger);
        }
        if (resource.direction !== undefined) {
            dir = check_direction_tag(resource.direction, Global.logger);
        }
    }

    if (lang === undefined || lang === null) {
        delete retval.language;
    } else {
        retval.language = lang;
    }
    if (dir === undefined || dir === null) {
        delete retval.direction;
    } else {
        retval.direction = dir;
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
        Global.logger.log("Localizable string without a value (removed)", LogLevel.FatalError);
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
const create_CreatorInfo = (resource: any) : Entity => {
    const retval = new Entity_Impl();
    if (typeof resource === "string") {
        retval.name = [create_LocalizableString(resource)];
        retval.type = ["Person"];
    } else {
        if (resource['name']) {
            normalize(Entity_Impl.terms, retval, resource);
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
const check_CreatorInfo = (resource: Entity) : boolean => {
    let retval: boolean = true;
    if (!resource.name) {
        Global.logger.log("Creator without a name (removed)", LogLevel.FatalError);
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
        Global.logger.log("Name (title) is missing for the manifest", LogLevel.FatalError);
        return empty;
    }

    if (manifest.readingOrder.length === 0) {
        Global.logger.log("Default reading order is missing for the manifest", LogLevel.FatalError);
        return empty;
    }

    if (manifest.type.length === 0) {
        Global.logger.log("Type information is missing for the manifest", LogLevel.ValidationError);
        manifest.type = ['CreativeWork'];
    }

    if (manifest.inLanguage) manifest.inLanguage = manifest.inLanguage.map((lang) :string => check_language_tag(lang, Global.logger));

    // check dates for date published and updated

    if (manifest.readingProgression) {
        if (!(manifest.readingProgression === ProgressionDirection.rtl || manifest.readingProgression === ProgressionDirection.ltr)) {
            Global.logger.log(`readingProgression value ('${manifest.readingProgression}') is invalid`, LogLevel.ValidationError);
            manifest['readingProgression'] = ProgressionDirection.rtl;
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
            .map((val: any) :T => creator(val))
            .filter((value: T): boolean => checker(value));
}


/* **************************** Top level generator function for the content of an instance **************************** */
/* -- 6. Normalize _manifest_ -- */
/**
 * Generic tool to convert a (originally JSON) object into a class. It consider all the predefined terms and,
 * if they appear in the `source`, they are transformed into direct values, arrays of Localizable Strings, Entities, strings, etc,
 * depending of the value type assigned to the term by the Pub Manifest specification. The converted, and properly typed, instances
 * are then added as bona fide terms to `target`
 *
 * This corresponds to the 'normalization' step in the specification, under step (6). However, it merges the normalization
 * step with the setting of the value in the final manifest; this is necessary to set the right values in the
 * Typescript class.
 *
 * Note also that the calls to the various normalization steps are recursive. A step, usually:
 *
 * - creates an object of a specific type, e.g., a Linked Resource
 * - performs the normalization steps for all the terms that are relevant to that particular type of objects by
 *   calling this function again on the terms of that particular object
 *
 * That corresponds to steps h and i in the document
 *
 * @param terms categorization of property names; each variable in `terms` is an array of term names
 * @param processed the class where the values should be put
 * @param manifest the (originally JSON) object to get the values from
 */
function normalize(terms: Terms, processed: PublicationManifest_Impl | LinkedResource_Impl | Entity_Impl, manifest: any) {
    // Some terms should just be copied, no specific steps in the document
    terms.single_literal.forEach((term: string) => {
        if (manifest[term]) processed[term] = create_string(manifest[term]);
    })

    /* -- 6.b turn single objects into arrays, without converting them -- */
    terms.array_of_literals.forEach((term: string) => {
        if (manifest[term]) processed[term] = get_ObjectArray<string>(manifest[term], create_string, check_string);
    })

    /* -- 6.d turn single string into a Localizable String -- */
    terms.single_string.forEach((term: string) => {
        if (manifest[term]) processed[term] = create_LocalizableString(manifest[term]);
    })

    /* -- 6.b and 6.d turn an array of single strings or Localizable Strings into an array of Localizable Strings -- */
    terms.array_of_strings.forEach((term: string) => {
        if (manifest[term]) processed[term] = get_ObjectArray<LocalizableString>(manifest[term], create_LocalizableString, check_LocalizableString);
    })

    /* -- 6.b. and 6.c turn an array of single strings or Entities into an array of Entities -- */
    terms.array_of_entities.forEach((term: string) => {
        if (manifest[term]) processed[term] = get_ObjectArray<Entity>(manifest[term], create_CreatorInfo, check_CreatorInfo);
    })

    /* -- 6.b. and 6.e turn an array of single strings or linked resources into an array of Linked Resources -- */
    terms.array_of_links.forEach((term: string) => {
        if (manifest[term]) processed[term] = get_ObjectArray<LinkedResource>(manifest[term], create_LinkedResource, check_LinkedResource);
    })

    /* -- 6.f check the URL -- */
    terms.single_url.forEach((term: string) => {
        if (manifest[term]) {
            const abs_url = create_URL(manifest[term]);
            check_Web_URL(abs_url);
            processed[term] = abs_url;
        }
    });

    /* -- 6.b. and 6.f convert and check arrays of URLs -- */
    terms.array_of_urls.forEach((term:string) => {
        if (manifest[term]) processed[term] = get_ObjectArray<URL>(manifest[term], create_URL, check_Web_URL);
    })

    /* -- copy booleans -- */
    terms.single_boolean.forEach((term: string) => {
        if (manifest[term]) processed[term] = manifest[term];
    })
}

/* **************************** Top level entry point **************************** */

/**
 * _The_ entry point to the conversion.
 *
 * @param url the url of the manifest
 * @param logger generic logger instance to log warnings and errors during processing
 * @returns a bona fide `PublicationManifest` instance
 */

export async function process_manifest(url: string, logger: Logger) : Promise<PublicationManifest> {
    Global.logger = logger;
    Global.base = url;

    /* -- 1. Let _processed_ be a map containing the internal representation of the manifest. --*/
    const processed = new PublicationManifest_Impl();

    /* -- 2. Let _manifest_ be the result of parsing JSON into Infra values given text. If manifest is not a map, fatal error, return failure. --*/
    // This is not a full implementation, because we do not consider the whole problem area of extracting it from HTML, etc. This is, after all,
    // a test for the processing steps...
    let manifest;
    // retrieve the manifest and convert it into
    try {
        manifest = await fetch_json(url);
    } catch (err) {
        logger.log(`JSON fetching or parsing error: ${err.message}`, LogLevel.FatalError);
        return processed;
    }

    /* -- 3.  If manifest["context"] is not set to a list, or the first and second items in manifest["@context"] are not the string values "https://schema.org" and "https://www.w3.org/ns/pub-context", in this order, fatal error, return failure --*/
    if (manifest["@context"]) {
        // To simplify, turn this into an array in any case
        const contexts = toArray(manifest["@context"]);
        if ( contexts.length >= 2 && contexts[0] === "https://schema.org" && contexts[1] === "https://www.w3.org/ns/pub-context" ) {
            /* -- 5. Global declarations: extract the values of @language and @direction, if any  --*/
            contexts.slice(2).forEach( (context) => {
                if (context.language !== undefined) {
                    Global.language = check_language_tag(context.language, Global.logger);
                }
                if (context.direction !== undefined) {
                    Global.direction = check_language_tag(context.direction, Global.logger);
                }
            });
        } else {
            Global.logger.log("@context values are not set as required", LogLevel.FatalError);
        }
    } else {
        Global.logger.log("No @context set in manifest", LogLevel.FatalError);
    }

    /* -- 4. Set _profile --*/
    if (manifest.conformsTo) {
        // To simplify, turn this into an array in any case
        const conformsTo = toArray(manifest.conformsTo);
        if (conformsTo.length === 0) {
            Global.logger.log("No conformance statement, set to default", LogLevel.ValidationError);
            processed.profile = 'http://www.w3.org/TR/pub-manifest';
            processed.conformsTo = ['http://www.w3.org/TR/pub-manifest'];
        } else {
            // Note that this test is simpler than it would be in a complete implementation, because this
            // user agent has only one accepted profile. If there were more, it should look for the
            // first available one.
            if (conformsTo.find((s) => s === accepted_profile) !== undefined) {
                processed.profile = accepted_profile
            } else {
                Global.logger.log("No acceptable profile URI, set to default", LogLevel.ValidationError);
                processed.profile = 'http://www.w3.org/TR/pub-manifest';
            }
            processed.conformsTo = conformsTo;
        }
    } else {
        Global.logger.log("No conformance statement, set to default", LogLevel.ValidationError);
        processed.profile = 'http://www.w3.org/TR/pub-manifest';
        processed.conformsTo = ['http://www.w3.org/TR/pub-manifest'];
    }
    // Not sure this will ever be used, but it doesn't do any harm
    Global.profile = processed.profile;

    if (Global.logger.fatal_errors.length > 0) return processed;

    try {
        normalize(PublicationManifest_Impl.terms, processed, manifest);
    } catch( err ) {
        logger.log(`${err.message}`, LogLevel.FatalError);
    }
    return check_PublicationManifest(processed);
}
