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
    Person,
    Organization,
    ProgressionDirection
} from './manifest';

/* ===================================================================================================
 The implementations for the official interfaces, i.e., the bona fide classes
 ===================================================================================================== */
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

/* ====================================================================================================
 Various utilities
 ====================================================================================================== */
import {
    Logger,
    toArray,
    check_language_tag,
    check_direction_tag,
    copy_object,
    recognized_type,
    get_terms,
    fetch_json
} from './utilities';

import * as urlHandler from 'url';
import * as validUrl from 'valid-url';
import * as _ from 'underscore';
import moment from 'moment';


// This should really be an underscore function...
const isMap = (value: any): boolean => _.isObject(value) && !_.isArray(value) && !_.isFunction(value);

/* ====================================================================================================
 Global objects and constants
 ====================================================================================================== */

/**
 * The URL of the 'default' profile for the conformance.
 * (This still has to stabilize in the spec)
 */
const default_profile = 'https://www.w3.org/TR/pub-manifest/';
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
const create_Entity = (resource: any) : Person|Organization => {
    if (resource === null || _.isBoolean(resource) || _.isNumber(resource) || _.isArray(resource)) {
        Global.logger.log_validation_error(`Invalid entity`, resource, true);
        return undefined;
    } else if (_.isString(resource)) {
        const new_entity = new Person_Impl();
        const new_person = new LocalizableString_Impl();
        new_person.value = resource;
        new_entity.name = [new_person];
        new_entity.type = ["Person"];
        return new_entity;
    } else if (isMap(resource)) {
        // Beyond setting the type, the returned value should have the right (Typescript) type
        let new_entity;
        if (resource.type) {
            if (resource.type.includes('Person')) {
                new_entity = new Person_Impl();
            } else if (resource.type.includes('Organization')) {
                new_entity = new Organization_Impl();
            } else {
                resource.type.push('Person');
                new_entity = new Person_Impl();
            }
        } else {
            new_entity = new Person_Impl();
            resource.type = ['Person']
        }
        copy_object(resource, new_entity);
        return new_entity;
    } else {
        return undefined;
        // Actually, returning undefined is a default action when no 'return' is present
        // but it is cleaner to make this explicit
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
    if (resource === null || _.isBoolean(resource) || _.isNumber(resource) || _.isArray(resource)) {
        Global.logger.log_validation_error(`Invalid localizable string`, resource, true );
        return undefined;
    } else if (_.isString(resource)) {
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
        const new_ls = new LocalizableString_Impl();
        copy_object(resource, new_ls);
        if (new_ls.language) {
            if (new_ls.language === null) delete new_ls.language;
        } else if (Global.lang !== ''){
            new_ls.language = Global.lang;
        }
        if (new_ls.direction) {
            if (new_ls.direction === null) delete new_ls.direction;
        } else if (Global.dir !== '') {
            new_ls.direction = Global.dir;
        }
        return new_ls
    } else {
        // I am not sure this would occur at all but, just to be on the safe side...
        return undefined;
        // Actually, returning undefined is a default action when no 'return' is present
        // but it is cleaner to make this explicit
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
    if (resource === null || _.isBoolean(resource) || _.isNumber(resource) || _.isArray(resource)) {
        Global.logger.log_validation_error(`Invalid Linked Resource`, resource, true);
        return undefined;
    } else if (_.isString(resource)) {
        const new_lr = new LinkedResource_Impl();
        new_lr.url = resource;
        new_lr.type = ['LinkedResource'];
        return new_lr
    } else if (isMap(resource)) {
        const new_lr = new LinkedResource_Impl();
        copy_object(resource, new_lr);
        if (new_lr.type) {
            if (!new_lr.type.includes('LinkedResource')) {
                new_lr.type.push('LinkedResource');
            }
        } else {
            new_lr.type = ['LinkedResource']
        }
        return new_lr;
    } else {
        // I am not sure this would occur at all but, just to be on the safe side...
        return undefined;
        // Actually, returning undefined is a default action when no 'return' is present
        // but it is cleaner to make this explicit
    }
}

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
export async function generate_representation(url: string, base: string, logger: Logger): Promise<PublicationManifest> {
    // This is necessary to make the language and direction global extraction in a TS happy way...
    interface lang_dir {
        language?: string;
        direction?: string;
    }

    Global.logger = logger;
    // In the real world the value of base must be checked against invalid or malicious URL-s!
    // The reuse of the url as a base is not specified in the standard, and is here simply to
    // make testing easier. If the code is reused in real, this may have to be modified
    Global.base = (base === undefined || base === '') ? url : base;

    /* ============ The individual processing steps, following the spec ============== */
    /* Step: create the, initially empty, processed manifest */
    let processed = new PublicationManifest_Impl();

    /* Step: get the manifest. This step does more than just parsing; it retrieves the content via the URL */
    let manifest: PublicationManifest_Impl;
    // retrieve the manifest and convert it into
    try {
        manifest = await fetch_json(url);
    } catch (err) {
        logger.log_fatal_error(`JSON fetching or parsing error: ${err.message}`, null, true);
        return {} as PublicationManifest
    }

    /* Step: extract and check the context */
    let contexts: (string|lang_dir)[] = [];
    if (manifest['@context']) {
        // To simplify, turn this into an array in any case
        contexts = toArray(manifest["@context"]);
        if ( !(contexts.length >= 2 && contexts[0] === "https://schema.org" && contexts[1] === "https://www.w3.org/ns/pub-context") ) {
            logger.log_fatal_error(`The required contexts are not provided`);
            return {} as PublicationManifest
        }
    } else {
        logger.log_fatal_error(`No context provided`);
        return {} as PublicationManifest
    }

    /* Step: profile conformance */
    if(!(manifest.conformsTo)) {
        // No conformance has been provided. That is, in this case, a validation error
        logger.log_validation_error(`No conformance was set (falling back to default)`);
        Global.profile = default_profile;
    } else {
        const conforms = toArray(manifest.conformsTo);
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
        } else {
            Global.profile = conforms[0];
        }
    }
    processed.profile = Global.profile;

    /* Step: global declarations, ie, extract the global language and direction settings if any */
    {
        let lang = '';
        let dir  = '';
        for (let i = contexts.length - 1; i >= 0; i--) {
            if (typeof contexts[i] === 'object') {
                let c = contexts[i] as lang_dir;
                if (lang === '' && c.language) {
                    lang = c.language
                }
                if (dir === '' && c.direction) {
                    dir = c.direction
                }
                if (lang !== '' && dir !== '') break;
            }
        }
        if (lang !== '') {
            if (check_language_tag(lang, logger)) {
                Global.lang = lang;
            } else {
                // error message is generated in the check_language_tag function;
            }
        }
        if (dir !== '') {
            if (check_direction_tag(dir, logger)) {
                Global.dir = dir;
            } else {
                // error message is generated in the check_direction_tag function;
            }
        }
    }

    /* Step: go (recursively!) through all the term in manifest, normalize the value, an set it in processed */
    Object.getOwnPropertyNames(manifest).forEach( (term:string): void => {
        const value = manifest[term];
        const normalized = normalize_data(processed, term, value);
        if (normalized !== undefined) {
            processed[term] = normalized;
        }
    })

    /* Step: Data validation */
    processed = data_validation(processed)

    /* Step: HTML defaults (not implemented)  */

    /* Step: return processed */
    return processed
}


/**
 *
 * Normalize Data. This corresponds to the main body of
 * [§4.3.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#normalize-data).
 *
 * @param context 'context', in this case the object that has invoked the function
 * @param term property term
 * @param value property value
 */
function normalize_data(context: PublicationManifest_Impl|RecognizedTypes_Impl, term: string, value: any): any {
    /**
     * Helper function, to make the code below a bit more readable: normalize the content of a map. This
     * function calls (recursively) to the normalize_data function itself.
     *
     * Per spec if one of the values for a key in the map is undefined (i.e., 'failure') the key/value pair
     * is removed from the map.
     *
     * @param item the map to be normalized
     */
    const normalize_map = (item: any): any => {
        if (recognized_type(item)) {
            Object.getOwnPropertyNames(item).forEach( (key:string): void => {
                const keyValue = item[key];
                const normalized_keyValue = normalize_data(item, key, keyValue);
                if (normalized_keyValue !== undefined) {
                    item[key] = normalized_keyValue;
                } else {
                    delete item[key];
                }
            })
        }
        return item;
    }

    // This is the important part of 'context' in this implementation: the categorization of terms of the context map
    const terms = get_terms(context);

    // console.log(`\n@@@@ ${JSON.stringify(terms)}`)

    /* ============ The individual processing steps, following the spec ============== */

    /* Step: by default, the value should be the normalized value */
    let normalized = value;

    /* Step: the "@context" term should be skipped */
    if (term === '@context') return undefined;

    if (terms) {
        // This is one of those objects that have assigned terms.
        // In theory, any other objects can be added to the manifest and that should not be forbidden, just copied.

        /* Step: if necessary, normalization should turn single value to an array with that value */
        if (terms.array_terms.includes(term) && (_.isString(value) || _.isBoolean(value) || _.isNumber(value) || isMap(value) || value === null)) {
            // The 'toArray' utility checks and, if necessary, converts to array
            normalized = [value];
        }

        /* Step: converting entities into real ones, even if the information we have is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (terms.array_of_entities.includes(term)) {
            normalized = normalized.map(create_Entity).filter((entity: Entity): boolean => entity !== undefined);
        }

        /* Step: converting strings into localizable strings, even if the information is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (terms.array_of_strings.includes(term)) {
            normalized = normalized.map(create_LocalizableString).filter((entity: LocalizableString): boolean => entity !== undefined);
        }

        /* Step: converting strings into Linked Resources, even if the information is a simple string. */
        /* This step also includes some tests, which is the reason there is a filter in the expression below */
        if (terms.array_of_links.includes(term)) {
            normalized = normalized.map(create_LinkedResource).filter((entity: LinkedResource): boolean => entity !== undefined);
        }

        /* Step a: create an absolute URL from a string */
        if (terms.single_url.includes(term)) {
            // Note that the conversion function may return undefined, which is then forwarded back to the caller
            normalized = convert_to_absolute_URL(value);
        }
        /* Step b: create an array of absolute URLs from a strings */
        if (terms.array_of_urls.includes(term)) {
            normalized = normalized.map(convert_to_absolute_URL).filter((entity: URL): boolean => entity !== undefined);
        }
    }

    /* Step: extension point (not implemented) */

    /* Step: recursively normalize the values of normalize */
    // A previous step may have set an undefined value, this has to be ignored, again just to be on the safe side
    if (normalized !== undefined) {
        if (_.isArray(normalized)) {
            // Go through each entry, normalize, and remove any undefined value
            normalized = normalized.map((item: any) => (isMap(item) ? normalize_map(item) : item)).filter((item: any) => item !== undefined);
        } else if (isMap(normalized)) {
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
const convert_to_absolute_URL = (resource: any): URL => {
    if (!_.isString(Global.base) || Global.base === '' || Global.base === null) {
        Global.logger.log_validation_error(`Invalid base ${Global.base}`, null, true);
        return undefined;
    }
    if (!_.isString(resource)  || resource === '' || resource === null ) {
        Global.logger.log_validation_error(`Invalid relative URL ${resource}`, null, true);
        return undefined;
    } else {
        const new_url = urlHandler.resolve(Global.base, resource);
        // The check URL function checks the validity of the URL and whether it is a valid URL
        if (validUrl.isUri(new_url) === undefined) {
            Global.logger.log_validation_error(`${new_url} is an invalid URL`);
            return undefined;
        } else {
            return new_url;
        }
    }
}


/**
 *
 * Data Validation. This corresponds to the main body of
 * [§4.3.2 of the Publication Manifest](https://www.w3.org/TR/pub-manifest#validate-data).
 *
 * @param data the data to be checked
 * @return checked data (the final value of processed)
 */
function data_validation(data: PublicationManifest_Impl): PublicationManifest_Impl {
    // Only those terms should be used which have a definition in the spec, others should be ignored
    const defined_terms = get_terms(data).array_terms;

    /* ============ The individual processing steps, following the spec ============== */

    /* Step: perform global data check. (That also includes value type checks.) */
    Object.getOwnPropertyNames(data).forEach((key:string): void => {
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
        data.type = ["CreativeWork"]
    }

    /* Step: accessibility */
    if (data.accessModeSufficient) {
        data.accessModeSufficient = data.accessModeSufficient.filter((ams: any): boolean => {
            return isMap(ams) && ams.type && ams.type === 'ItemList'
        })
    }

    /* Step: identifier check */
    if (!(data.id && _.isString(data.id) && data.id !== '')) {
        Global.logger.log_validation_error(`Missing or invalid identifier`, data.id);
    }

    /* Step: duration check */
    if (data.duration) {
        const durationCheck = RegExp('P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?');
        if (!(durationCheck.test(data.duration))) {
            Global.logger.log_validation_error(`"${data.duration}" is an incorrect duration value`, null, true);
            delete data.duration;
        }

        // check the value and remove if wrong
    }

    /* Step: last modification date */
    if (data.dateModified) {
        if (!moment(data.dateModified,moment.ISO_8601).isValid()) {
            Global.logger.log_validation_error(`"${data.dateModified}" is an incorrect date string`, null, true);
            delete data.dateModified;
        }
    }

    /* Step: Publication date */
    if (data.datePublished) {
        if (!moment(data.datePublished,moment.ISO_8601).isValid()) {
            Global.logger.log_validation_error(`"${data.datePublished}" is an incorrect date string`, null, true);
            delete data.datePublished;
        }
    }

    /* Step: inLanguage */
    if (data.inLanguage) {
        data.inLanguage = data.inLanguage.filter((item: any): boolean => {
            const check_result = check_language_tag(item, Global.logger);
            return check_result !== null && check_result !== undefined;
        })
    }

    /* Step: progression direction */
    if (data.readingProgression) {
        const check_result = check_direction_tag(data.readingProgression, Global.logger);
        if (check_result === undefined) data.readingProgression = ProgressionDirection.ltr;
    } else {
        data.readingProgression = ProgressionDirection.ltr;
    }

    /* Step: profile extension point (not implemented) */

    /* Step: run remove empty arrays */
    // Care should be taken to run this only on entries that are part of the definition of this object!
    Object.getOwnPropertyNames(data).forEach((key:string): void => {
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
function global_data_checks(context:  PublicationManifest_Impl|RecognizedTypes_Impl, term: string, value: any): any {
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
            const map_data_check = (item: any): any => {
                if (recognized_type(item)) {
                    // Check that the key is defined!!! Maybe using _.intersection?
                    Object.getOwnPropertyNames(item).forEach((key): void => {
                        const keyValue = item[key];
                        item[key] = global_data_checks(item, key, keyValue);
                        if (item[key] === undefined) {
                            delete item[key]
                        }
                    })
                }
                return item;
            };
            if (isMap(value)) {
                map_data_check(value);
            } else if (_.isArray(value)) {
                value = value.map(map_data_check);
            }
        }

        /* Step: check the value of language and direction, possibly removing the value */
        if (terms.array_of_strings.includes(term)) {
            value = value.filter( (item: LocalizableString_Impl): boolean => {
                if (!item.value) {
                    Global.logger.log_validation_error(`Missing value for a Localizable String`, item, true);
                    return false;
                }
                if (item.language) {
                    const lang_check = check_language_tag(item.language, Global.logger);
                    if (lang_check === undefined || lang_check === null) {
                        delete item.language;
                    }
                }
                if (item.direction) {
                    const dir_check = check_direction_tag(item.direction, Global.logger);
                    if (dir_check === undefined || dir_check === null) {
                        delete item.direction;
                    }
                }
                return true;
            });
        }

        /* Step: an entity must have a name */
        if (terms.array_of_entities.includes(term)) {
            value = value.filter((item: Entity): boolean => {
                if (!item.name) {
                    Global.logger.log_validation_error(`Missing name for a Person or Organization in "${term}"`, item, true);
                    return false;
                } else {
                    item.name = item.name.filter((name) => (name.value && name.value !== ''));
                    return true;
                }
            });
        }

        /* Step: check linked resources; it must have a url, and the value of length and alternate must be checked, too */
        if (terms.array_of_links.includes(term)) {
            value = value.filter((resource: LinkedResource): boolean => {
                if (!resource.url) {
                    Global.logger.log_validation_error(`URL is missing from a linked resource in "${term}"`, resource, true);
                    return false;
                } else {
                    if (validUrl.isUri(resource.url) === undefined) {
                        Global.logger.log_validation_error(`${resource.url} is is not a valid URL`, null, true);
                        return false;
                    }
                }
                if (resource.length) {
                    if (!(_.isNumber(resource.length) && resource.length >= 0)) {
                        Global.logger.log_validation_error(`Linked Resource length is is invalid in  "${term}"`, resource, true);
                        return false;
                    }
                }
                if (resource.alternate) {
                    resource.alternate.forEach((alternate: LinkedResource): void => {
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
function verify_value_category(context:  PublicationManifest_Impl|RecognizedTypes_Impl|LocalizableString_Impl, term: string, value: any): boolean {

    const check_expected_type = (keys: Terms, key: string, obj: any): boolean => {
        if (keys.array_or_single_literals.includes(key)) {
            return _.isString(obj);
        } else if (keys.array_of_strings.includes(key)) {
            return obj instanceof LocalizableString_Impl;
        } else if (keys.array_of_entities.includes(key)) {
            return obj instanceof Entity_Impl;
        } else if (keys.array_of_links.includes(key)) {
            return obj instanceof LinkedResource_Impl;
        } else if (keys.array_or_single_urls.includes(key)) {
            return _.isString(obj);
        } else if (keys.single_number.includes(key)) {
            return _.isNumber(obj);
        } else if (keys.single_boolean.includes(key)) {
            return _.isBoolean(obj);
        } else {
            // No constraint defined
            return true;
        }
    };

    const check_expected_type_and_report = (keys: Terms, key: string, obj: any): boolean => {
        const check_result = check_expected_type(keys, key, obj);
        if (!check_result) {
            Global.logger.log_validation_error(`Type validation error for "${key}":`, value, true );
        }
        return check_result;
    };

    const verify_map = (obj: PublicationManifest_Impl|RecognizedTypes_Impl|LocalizableString_Impl): boolean => {
        const keys = get_terms(obj);
        const defined_terms = keys.all_terms;
        Object.getOwnPropertyNames(obj).forEach((key: string) => {
            if (defined_terms.includes(key)) {
                const check_result = verify_value_category(obj, key, obj[key])
                if (!(check_result)) {
                    delete obj[key];
                }
            }
        });
        // Check if there is any meaningful term left!
        if (defined_terms.find((key: string): boolean => Object.getOwnPropertyNames(obj).includes(key))) {
            return true;
        } else {
            return false;
        }
    };

    const terms = get_terms(context);

    if (terms.array_terms.includes(term)) {
        if (!(_.isArray(value))) {
            Global.logger.log_validation_error(`Value should be an array for "${term}"`, value );
            return false;
        } else {
            value = value.map((item: any): any => {
                if (check_expected_type_and_report(terms, term, item)) {
                    return isMap(item) ? verify_map(item) : item;
                } else {
                    // wrong type
                    return false;
                }
            }).filter((item:any): boolean => item !== undefined);

            if (value.length === 0) {
                Global.logger.log_validation_error(`Empty array after value type check for "${term}"`, null, true );
                return false;
            } else {
                return true;
            }
        }
    } else if (terms.maps.includes(term)) {
        if (!(isMap(value))) {
            Global.logger.log_validation_error(`Value should be a map for "${term}"`, value);
            return false;
        } else {
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
function remove_empty_arrays(value: any): boolean {
    if (_.isArray(value) && value.length === 0) {
        return false;
    } else if (isMap(value)) {
        Object.getOwnPropertyNames(value).forEach((key:string): void => {
            const keyValue = value[key];
            if (!remove_empty_arrays(keyValue)) {
                delete value[key]
            }
        });
    }
    return true;
}
