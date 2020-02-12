/**
 * Generic module to implement publication profiles. It defines a generic interface and an 'empty' profile; the latter can be used
 * as some sort of a default profile with, essentially, empty extension functions.
 *
 */

/** The interface to the global data instance */
import { Global } from './utilities';
import {
    URL,
    PublicationManifest,
    LinkedResource,
    LocalizableString,
    Entity,
    Person,
    Organization,
    ProgressionDirection,
    RecognizedTypes
} from './../manifest';

import {
    Entity_Impl,
    Person_Impl,
    Organization_Impl,
    LocalizableString_Impl,
    LinkedResource_Impl,
    RecognizedTypes_Impl,
    PublicationManifest_Impl,
    Terms
} from './terms';


/**
 * Generic interface for a profile
 */
export interface Profile {
    /**
     * Identifier of a profile. This is the URL that should be used in the `conformsTo` term of the manifest to use this profile.
     */
    identifier: URL;

    /**
     * "Top level" callback to check the profile dependent context files, and possibly process them for a
     * profile dependent value. This corresponds to the first extension point in the main body of
     * [§7.4  Publication Manifest](https://www.w3.org/TR/pub-manifest/#processing-algorithm).
     *
     * @param manifest - the original manifest, i.e., the result of the JSON parsing
     * @param processed - the generated manifest representation
     * @returns - the same object as `processed`, with possible additions, or `null` if a fatal error is found (e.g., missing context file that is required for the profile)
     */
    validate_context : (manifest: PublicationManifest_Impl, processed: PublicationManifest_Impl) => PublicationManifest_Impl;

    /**
     * "Top level" callback done as the last step of the manifest generation. This corresponds to the second extension point in the main body of
     * [§7.4  Publication Manifest](https://www.w3.org/TR/pub-manifest/#processing-algorithm).
     *
     * @param processed - the generated manifest representation
     * @returns - the same object as `processed`, with possible additions
     */
    generate_internal_representation : (processed: PublicationManifest_Impl) => PublicationManifest_Impl;

    /**
     * Last step of the normalization of a key/value pair in context. The only extra step in the main processing part is to
     * (recursively) call to the global normalization on all constituents. This corresponds to the extension point in the main body of
     * [§7.4.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#normalize-data).
     *
     * @param context - 'context', i.e., the object on which the function has been invoked
     * @param term - property term
     * @param value - property value
     * @returns - the “normalized” value, or `undefined` if a fatal error occurs
    */
    normalize_data : (context: PublicationManifest_Impl | RecognizedTypes_Impl, term: string, value: any) => any;

    /**
     * Last step of data validation, right before empty arrays are removed and the value is returned to the main processing.
     * This corresponds to the profile extension point in the main body of
     * [§7.4.2 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#validate-data).
     *
     * @param data - the data to be checked
     * @return - checked data (becomes, eventually, the final value of `processed` in [[generate_internal_representation]])
     */
    data_validation: (data: PublicationManifest_Impl) => PublicationManifest_Impl;

    /**
     * Add default values from the (possible) HTML document. This corresponds to the profile extension point in
     * [§7.4.3 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#add-html-defaults).
     *
     * @param data - the (almost) final processed manifest
     * @returns - `null` if a fatal error has been raised, the original (albeit possibly modified) data otherwise.
     */
    add_default_values: (data: PublicationManifest_Impl) => PublicationManifest_Impl;

    /**
     * Look for a (possible) TOC element, possibly preempting the general mechanism of finding the ToC via the manifest.
     *
     * @param manifest - the generated manifest (by that point all manifest processing, cleanup, etc, is done)
     * @returns - the ToC element, if found, `null` otherwise
     */
    get_toc_element: (manifest: PublicationManifest) => HTMLElement;
}

/**
 * Default profile: all methods are empty, i.e., simply return the incoming values. See [[Profile]] for the details of the method
 * specifications.
 */
export const default_profile: Profile = {
    identifier: 'https://www.w3.org/TR/pub-manifest/',

    validate_context(manifest: PublicationManifest_Impl, processed: PublicationManifest_Impl) : PublicationManifest_Impl {
        return processed;
    },

    generate_internal_representation(processed: PublicationManifest_Impl): PublicationManifest_Impl {
        return processed;
    },

    normalize_data(context: PublicationManifest_Impl | RecognizedTypes_Impl, term: string, value: any): any {
        return value;
    },

    data_validation(data: PublicationManifest_Impl): PublicationManifest_Impl {
        return data;
    },

    add_default_values(data: PublicationManifest_Impl): PublicationManifest_Impl {
        return data;
    },

    get_toc_element(data: PublicationManifest): HTMLElement {
        return null;
    }
}
