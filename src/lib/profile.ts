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
} from './manifest_classes';


/**
 * Generic interface for a profile
 */
export interface Profile {
    /**
     * Identifier of a profile. This is the URL that should be used in the `conformsTo` term of the manifest to use this profile.
     */
    identifier: URL;

    /**
     * "Top level" callback done as the last step of the manifest generation. This corresponds to the extension point in the main body of
     * [§7.4  Publication Manifest](https://www.w3.org/TR/pub-manifest/#processing-algorithm).
     *
     * @param processed - the generated manifest representation
     * @returns - the same object as `processed`, with possible additions
     */
    generate_internal_representation : (processed: PublicationManifest) => PublicationManifest;

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
     * @param global_data - global data instance, containing data like global language and direction tag, base URL, etc.
     * @param data - the (almost) final processed manifest
     * @returns - `null` if a fatal error has been raised, the original (albeit possibly modified) data otherwise.
     */
    add_default_values: (data: PublicationManifest_Impl) => PublicationManifest_Impl;
}

/**
 * Default profile: all methods are empty, i.e., simply return the incoming values. See [[Profile]] for the details of the method
 * specifications.
 */
export const default_profile: Profile = {
    identifier: 'https://www.w3.org/TR/pub-manifest/',

    generate_internal_representation(processed: PublicationManifest): PublicationManifest {
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
    }


}
