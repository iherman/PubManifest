/**
 * Implementation (with minor omission, see comments) of the Processing steps as define in
 * [§4 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#manifest-processing).
 *
 * Note, however, that the HTML related functions (e.g., extracting `<title>`) is _not_ implemented
 * at this point.
 */

/* ===================================================================================================
  The interfaces defining the manifest interfaces. This is what the external world should
  'see' in the return value, i.e., _processed_
 ===================================================================================================== */
import {
    PublicationManifest,
    LinkedResource,
    LocalizableString,
    Entity,
    ProgressionDirection
} from './manifest';

/* ===================================================================================================
 The implementations for the official interfaces, i.e., the bona fide classes
 ===================================================================================================== */
import {
    Entity_Impl,
    LocalizableString_Impl,
    LinkedResource_Impl,
    PublicationManifest_Impl,
    Terms,
    URL
} from './manifest_classes';

/* ====================================================================================================
 Various utilities
 ====================================================================================================== */
import {
    LogLevel,
    Logger,
    toArray,
    check_url,
    check_language_tag,
    check_direction_tag,
    isNumber, isArray, isMap, isString, isBoolean,
    fetch_json
} from './utilities';

import * as url from 'url';

/* ====================================================================================================
 Global objects and constants
 ====================================================================================================== */

/**
 * The URL of the 'default' profile for the conformance.
 * (This still has to stabilize in the spec)
 */
const default_profile = 'http://www.w3.org/TR/pub-manifest/';
const known_profiles = [default_profile, 'https://www.w3.org/TR/audiobooks/']

/**
 * "Global" object; these values help in streamlining some of the functions
 */
class Global  {
    static logger:  Logger;
    static lang:    string = '';
    static dir:     string = '';
    static base:    string = '';
    static profile: string = '';
}

const copy_object = (resource:any, target:any): void => {
    Object.getOwnPropertyNames(resource).forEach((key:string):void => target[key] = resource[key]);
}

/* ====================================================================================================
 Utility functions on the processing steps
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
const create_Entity = (resource: any) : Entity => {
    if (resource === null || isBoolean(resource) || isNumber(resource) || isArray(resource)) {
        Global.logger.log(`Invalid entity ${resource}`, LogLevel.ValidationError);
        return undefined;
    } else if (isString(resource)) {
        const name = new LocalizableString_Impl();
        name.value = resource;
        const new_entity = new Entity_Impl();
        new_entity.name = [name];
        new_entity.type = ["Person"];
        return new_entity;
    } else if (isMap(resource)) {
        const new_entity = new Entity_Impl;
        copy_object(resource, new_entity);
        return new_entity;
    }
}

/**
 * Create a new localizable string
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * This is used for the implementation of step §4.3.1/4.
 *
 * @param resource either a string or a (originally JSON) object
 */
const create_LocalizableString = (resource: any): LocalizableString => {
    if (resource === null ||isBoolean(resource) || isNumber(resource) || isArray(resource)) {
        Global.logger.log(`Invalid localizable string ${resource}`, LogLevel.ValidationError);
        return undefined;
    } else if (isString(resource)) {
        const new_ls = new LocalizableString_Impl();
        new_ls.value = resource;
        if (Global.lang !== '') {
            new_ls.language = Global.lang
        }
        if (Global.dir !== '') {
            new_ls.direction = Global.dir
        }
        return new_ls
    } else if (isMap(resource)) {
        const new_ls = resource as LocalizableString_Impl;
        if (new_ls.language) {
            if (new_ls.language === null) delete new_ls.language;
        } else {
            new_ls.language = Global.lang;
        }
        if (new_ls.direction) {
            if (new_ls.direction === null) delete new_ls.direction;
        } else {
            new_ls.direction = Global.dir;
        }
        return new_ls
    }
}


/**
 * Create a new Linked Resource
 * The input argument may be a string or an existing object; the specs describes how a full
 * class instance should be created.
 *
 * This is used for the implementation of step §4.3.1/5.
 *
 * @param resource either a string or a (originally JSON) object
 */
const create_LinkedResource = (resource: any): LinkedResource => {
    if (resource === null ||isBoolean(resource) || isNumber(resource) || isArray(resource)) {
        Global.logger.log(`Invalid Linked Resource ${resource}`, LogLevel.ValidationError);
        return undefined;
    } else if (isString(resource)) {
        const new_lr = new LinkedResource_Impl();
        new_lr.url = resource;
        new_lr.type = ["LinkedResource"];
        return new_lr
    } else if (isMap(resource)) {
        const new_lr = new LinkedResource_Impl();
        copy_object(resource, new_lr);
        return new_lr;
    }
}

/**
 * Create a new absolute URL
 *
 * This is used for the implementation of step §4.3.1/5.
 *
 * @param resource either a string or a (originally JSON) object
 */
const create_URL = (resource: any): URL => {
    if (resource === null || !isString(resource)) {
        Global.logger.log(`Invalid relative URL ${resource}`, LogLevel.ValidationError);
        return undefined;
    } else {
        return url.resolve(Global.base, resource) as URL;
    }
}


/* ====================================================================================================
 The main processing steps, as in the spec
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
 * @async
 * @param url: address of the JSON file
 * @param base: base URL; if undefined or empty, fall back on the value of url
 * @param logger: an extra parameter to collect the error and warning messages
 * @return the processed manifest
 *
 */
export async function process_a_manifest(url: string, base: string, logger: Logger): Promise<PublicationManifest> {
    // This is necessary to make the language and direction global extraction in a TS happy way...
    interface lang_dir {
        language?: string;
        direction?: string;
    }

    Global.logger = logger;
    // In the real world the value of base must be checked against invalid or malicious URL-s!
    Global.base = (base === undefined || base === '') ? url : base;

    /* ============ The individual processing steps, following the spec ============== */
    /* Step 1: create the, initially empty, processed manifest */
    const processed = new PublicationManifest_Impl();

    /* Step 2: get the manifest. This step does more than just parsing; it retrieves the content via the URL */
    let manifest: PublicationManifest_Impl;
    // retrieve the manifest and convert it into
    try {
        manifest = await fetch_json(url);
    } catch (err) {
        logger.log(`JSON fetching or parsing error: ${err.message}`, LogLevel.FatalError);
        return {} as PublicationManifest
    }

    /* Step 3: extract and check the context */
    let contexts: (string|lang_dir)[] = [];
    if (manifest['@context']) {
        // To simplify, turn this into an array in any case
        contexts = toArray(manifest["@context"]);
        if ( !(contexts.length >= 2 && contexts[0] === "https://schema.org" && contexts[1] === "https://www.w3.org/ns/pub-context") ) {
            logger.log(`The required contexts are not provided`, LogLevel.FatalError);
            return {} as PublicationManifest
        }
    } else {
        logger.log(`No context provided`, LogLevel.FatalError);
        return {} as PublicationManifest
    }

    /* Step 4: profile conformance */
    {
        let conforms: string[] = [];
        if (manifest.conformsTo) {
            conforms = toArray(manifest.conformsTo);
            // Check whether the audiobooks profile or the basic profile is on the list...
            const valid_values = conforms.filter((value) => known_profiles.includes(value));
            if (valid_values.length === 0) {
                logger.log(`No known profiles was used (falling back to default)`, LogLevel.ValidationError);
                Global.profile = default_profile;
            } else {
                Global.profile = valid_values[0];
            }
        } else {
            // No conformance has been provided. That is, in this case, a validation error
            logger.log(`No conformance was set (falling back to default)`, LogLevel.ValidationError);
            Global.profile = default_profile;
        }
    }
    processed.profile = Global.profile;

    /* Step 5: global declarations, ie, extract the global language and direction settings if any */
    {
        let lang = '';
        let dir  = '';
        for (let i = contexts.length - 1; i >= 0; i--) {
            if (typeof contexts[i] === 'object') {
                let c = contexts[i] as lang_dir;
                if (c.language) {
                    lang = c.language
                }
                if (c.direction) {
                    dir = c.direction
                }
                if (lang !== '' && dir !== '') break;
            }
        }
        if (lang !== '') {
            if (check_language_tag(lang, logger)) {
                Global.lang = lang;
            } else {
                logger.log(`Invalid language tag value (${lang})`, LogLevel.ValidationError);
            }
        }
        if (dir !== '') {
            if (check_direction_tag(dir, logger)) {
                Global.dir = dir;
            } else {
                logger.log(`Invalid base direction value (${dir})`, LogLevel.ValidationError);
            }
        }
    }

    /* Step 6: go (recursively!) through all the term in manifest, normalize the value, an set it in processed */
    Object.getOwnPropertyNames(manifest).forEach( (term:string): void => {
        const value = manifest[term];
        const normalized = normalize_data(processed, term, value);
        if (normalized !== undefined) {
            processed[term] = normalized;
        }
    })




    /* Step 9: return processed */
    return processed
}

/**
 *
 * Process Data. This corresponds to the main body of
 * [§4.3.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#normalize-data).
 *
 * @param term property term
 * @param value property value
 */
function normalize_data(context: PublicationManifest_Impl|Entity_Impl|LinkedResource_Impl, term: string, value: any): any {

    const normalize_map = (item: PublicationManifest_Impl|Entity_Impl|LinkedResource_Impl): any => {
        Object.getOwnPropertyNames(item).forEach( (key:string): void => {
            const keyValue = item[key];
            console.log(`key: ${key}, value: ${value}`)
            const normalized_keyValue = normalize_data(item, key, keyValue);
            if (normalized_keyValue !== undefined) {
                item[key] = normalized_keyValue;
            }
        })
        return item;
    }

    /* Step 1: by default, the value should be the normalized value */
    let normalized = value;

    if (context.terms) {
        // This is one of those objects that have assigned terms in the first place!
        // E.g., this method may be invoked with a Localizable String, which does not...

        /* Step 2: if necessary, normalization should turn single value to a string with that value */
        if (context.terms.array_terms.includes(term)) {
            // The 'toArray' utility checks and, if necessary, converts to array
            normalized = toArray(value);
        }

        /* Step 3: converting entities into real ones, even if the information we have is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (context.terms.array_of_entities.includes(term)) {
            normalized = normalized.map(create_Entity).filter((entity: Entity): boolean => entity !== undefined);
        }

        /* Step 3: converting strings into localizable strings, even if the information is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (context.terms.array_of_strings.includes(term)) {
            normalized = normalized.map(create_LocalizableString).filter((entity: LocalizableString): boolean => entity !== undefined);
        }

        /* Step 3: converting strings into Linked Resources, even if the information is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (context.terms.array_of_links.includes(term)) {
            normalized = normalized.map(create_LinkedResource).filter((entity: LinkedResource): boolean => entity !== undefined);
        }

        /* Step 6.a, create an absolute URL from a string */
        if (context.terms.single_url.includes(term)) {
            normalized = create_URL(value);
        }
        /* Step 6.b, create an array of absolute URLs from a strings */
        if (context.terms.array_of_urls.includes(term)) {
            normalized = normalized.map(create_URL).filter((entity: URL): boolean => entity !== undefined);
        }
    }

    /* Step 8, extension point (not implemented) */

    /* Step 9, recursively normalize the values of normalize */
    // A previous step may have set an undefined value, this has to be ignored
    if (normalized !== undefined) {
        if (isArray(normalized)) {
            // Go through each entry, normalize, and remove any undefined value
            normalized = normalized.map( (item: any) => (isMap(item) ? normalize_map(item) : item)).filter( (item: any) => item !== undefined )
        } else if (isMap(normalized)) {
            normalized = normalize_map(normalized);
        }
    }


    return normalized;
}



