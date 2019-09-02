import { PublicationManifest, LinkedResource, LocalizableString, CreatorInfo, TextDirection, ProgressionDirection } from './manifest';
import { CreatorInfo_Impl, LocalizableString_Impl, LinkedResource_Impl, PublicationManifest_Impl, Terms } from './manifest_classes';
import { LogLevel, Logger } from './logger';

// ---------------------------- Global object for the various utilities ----------------

class Global  {
    static logger: Logger;
    static language: string = '';
    static base: string = '';
}

// ------------------------------------ Conversion and checking utilities ---------------------------

/**
 * Name tells it all: if the argument is  single value, it is encapsulated into
 * an array. Used for Localizable String, Linked Resources, etc.
 *
 * @param {any} arg - the input value or array of values
 * @returns {any[]}
 */
const toArray = (arg: any) => Array.isArray(arg) ? arg : [arg];


const create_string = (arg: any) : string  => {
    if(typeof arg === "string") {
        return arg;
    } else {
        return `${arg}`;
    }
}

const check_string = (resource: string) : boolean => {
    return true;
}

const create_LinkedResource = (resource: any) : LinkedResource => {
    const retval = new LinkedResource_Impl();
    if (typeof resource === "string") {
        retval._url = resource;
        retval._type = ["LinkedResource"];
    } else {
        convert_object(LinkedResource_Impl.terms, retval, resource);
    }
    return retval;
}

const check_LinkedResource = (resource: LinkedResource) : boolean => {
    let retval: boolean = true;
    if (!resource.url) {
        Global.logger.log("Linked Resource without a url (removed)", LogLevel.error);
        retval = false;
    }
    return retval;
}

/**
 * Create a new Localizable String
 *
 * @param resource either a string or a (originally JSON) object
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
            retval._language = resource.language;
        }
    }

    // Set the language if not set...
    if (!retval.language && Global.language) {
        retval._language = Global.language
    }

    return retval;
}

const check_LocalizableString = (resource: LocalizableString) : boolean => {
    let retval: boolean = true;
    if (!resource.value) {
        Global.logger.log("Localizable string without a value (removed)", LogLevel.error);
        retval = false;
    }
    return retval;
}


/**
 * Create a new creator info, i.e., either a Person or an Organization.
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
            // this one is special
            if (resource['length']) retval['_length'] = resource['length'];
        }
    }
    return retval;
}

const check_CreatorInfo = (resource: CreatorInfo) : boolean => {
    let retval: boolean = true;
    if (!resource.name) {
        Global.logger.log("Creator without a name (removed)", LogLevel.error);
        retval = false;
    }
    return retval;
}


// ------------------------------------------------------------------

interface create_Object<T> {
    (arg: any): T;
}

interface check_Object<T> {
    (arg: T): boolean;
}
/**
 * Generic utility to create an array of object of a specific type
 * @param arg The original data from JSON: either a string, or an array of strings and objects
 * @param creator The method to create a bona fide typed class from a string or a (generic) object
 * @param checker Check the class instance for validity; in some cases this may result in removing it
 */
function get_ObjectArray<T>(arg: any, creator: create_Object<T>, checker: check_Object<T>) : T[] {
    return toArray(arg)
            .map( (val: any) :T => creator(val) )
            .filter( (value: T): boolean => checker(value) );
}

// ------------------------------------------------------------------


/**
 * Generic tool to convert a (originally JSON) object into a class. It consider all the predefined terms and,
 * if they appear in the `source`, they are transformed into direct values, arrays of Localizable Strings, Entities, strings, etc,
 * depending of the value type assigned to the term by the Pub Manifest specification.
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
    terms.multiple_entity_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<CreatorInfo>(source[term], create_CreatorInfo, check_CreatorInfo);
    })

    terms.multiple_link_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<LinkedResource>(source[term], create_LinkedResource, check_LinkedResource);
    })
}


export function create_manifest_object(manifest: string, logger: Logger) : PublicationManifest {
    const retval = new PublicationManifest_Impl();
    let obj;
    Global.logger = logger;

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
            // check language
            try {
                Global.language = contexts[2]["language"];
            } catch(e) {
                // no problem if that did not work; no language has been set
                ;
            }
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
    return retval;
}
