import { PublicationManifest, LinkedResource, LocalizableString, CreatorInfo, TextDirection, ProgressionDirection } from './manifest';
import { CreatorInfo_Impl, LocalizableString_Impl, LinkedResource_Impl, PublicationManifest_Impl, Terms } from './manifest_classes';
import { LogLevel, Logger } from './logger';

// ---------------------------- Global object for the various utilities ----------------

class Global  {
    static logger: Logger;
    static language: string = '';
    static base: string = '';
}

// ------------------------------------ Conversion utilities ---------------------------

/**
 * Name tells it all: if the argument is  single value, it is encapsulated into
 * an array. Used for Localizable String, Linked Resources, etc.
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

const create_LinkedResource = (resource: any) : LinkedResource => {
    if (typeof resource === "string") {
        return new LinkedResource_Impl(resource);
    } else {
        const retval = new LinkedResource_Impl(resource.url);
        if (resource.name) retval._name = resource.name;
        if (resource.description) retval._description = create_LocalizableString(resource.description);
        return retval;
    }
}

const create_LocalizableString = (resource: any) : LocalizableString => {
    if (typeof resource === "string") {
        return new LocalizableString_Impl(resource);
    } else {
        const retval = new LocalizableString_Impl(resource.value);
        if (resource.language) retval._language = resource.language;
        return retval;
    }
}

const create_CreatorInfo = (resource: any) : CreatorInfo => {
    if (typeof resource === "string") {
        const retval = new CreatorInfo_Impl([new LocalizableString_Impl(resource)]);
        retval._type = ["Person"];
        return retval;
    } else {
        const names = get_ObjectArray<LocalizableString>(resource, create_LocalizableString);
        return new CreatorInfo_Impl(names);
    }
}

// ------------------------------------------------------------------

interface create_Object<T> {
    (arg: any): T;
}

function get_ObjectArray<T>(arg: any, creator: create_Object<T>) : T[] {
    return toArray(arg).map( (val: any) => creator(val) );
}

// ------------------------------------------------------------------

// function convert_object(target: any, source: any)  {
//     target.single_literal_terms.forEach( (term: string) => {
//         if (source[term])
//             target[`_${term}`] = create_string(source[term]);
//     })
//     //return target;
// }

function convert_object(terms: Terms, target: PublicationManifest_Impl | LinkedResource_Impl | CreatorInfo_Impl, source: any) {

    // Some terms should just be copied
    terms.single_literal_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = create_string(source[term]);
    })

    // Some terms should be arrays, but otherwise their value remains unchanged
    terms.multiple_literal_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<string>(source[term], create_string);
    })

    // Some terms should be converted into a single Localizable String
    terms.single_loc_string_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = create_LocalizableString(source[term]);
    })

    // Some terms should be converted into an array of Localizable Strings
    terms.multiple_loc_string_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<LocalizableString>(source[term], create_LocalizableString);
    })

    // Some terms should be converted into an array of entities
    terms.multiple_entity_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<CreatorInfo>(source[term], create_CreatorInfo);
    })

    terms.multiple_link_terms.forEach( (term: string) => {
        if (source[term]) target[`_${term}`] = get_ObjectArray<LinkedResource>(source[term], create_LinkedResource);
    })
}


export function create_manifest_object(manifest: string, logger: Logger) : PublicationManifest {
    const retval = new PublicationManifest_Impl();
     let obj;

    // console.log(PublicationManifest_Impl.terms.all_terms());

    // The manifest text (i.e., JSON) must be turned into an object to be manipulated...
    try {
        const obj = JSON.parse(manifest);
        Global.logger = logger;

        // Some terms should just be copied
        PublicationManifest_Impl.terms.single_literal_terms.forEach( (term: string) => {
            if (obj[term])
                retval[`_${term}`] = create_string(obj[term]);
        })

        // Some terms should be arrays, but otherwise their value remains unchanged
        PublicationManifest_Impl.terms.multiple_literal_terms.forEach( (term: string) => {
            if (obj[term])
                retval[`_${term}`] = get_ObjectArray<string>(obj[term], create_string);
        })

 


        convert_object(PublicationManifest_Impl.terms, retval, obj);
    } catch( err ) {
        logger.assert(false, `${err.message}`, LogLevel.error);
    }
    return retval;

}
