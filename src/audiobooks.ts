/**
 * Module implementing the audiobook profile specific extension functions.
 *
 */

 /** The main interface defining what a Profile is for this implementation */
import { Profile } from './lib/profile';

/** Global data class */
import { Global } from './lib/utilities';

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
} from './manifest';

import {
    Entity_Impl,
    Person_Impl,
    Organization_Impl,
    LocalizableString_Impl,
    LinkedResource_Impl,
    RecognizedTypes_Impl,
    PublicationManifest_Impl,
    Terms
} from './lib/manifest_classes';

/**
 * Audiobook profile file instance. See [[Profile]] for the generic specification of this class;
 */
export const audiobook_profile: Profile = {
    identifier: 'https://www.w3.org/TR/audiobooks/',
    /**
     * "Top level" callback done as the last step of the manifest generation. This corresponds to the extension point in the main body of
     * [§7.4  Publication Manifest](https://www.w3.org/TR/pub-manifest/#processing-algorithm).
     *
     * This method implements the steps specified in
     * [§6 Manifest Processing][https://www.w3.org/TR/audiobooks/#audio-manifest-processing] of the Audiobooks specification: checking whether a table of content
     * is available.
     *
     * @param processed - the generated manifest representation
     * @returns - the same object as `processed`, with possible additions
     */
    generate_internal_representation(processed: PublicationManifest): PublicationManifest {
        return processed;
    },

    /**
     * Last step of the normalization of a key/value pair in context. The only extra step in the main processing part is to
     * (recursively) call to the global normalization on all constituents. This corresponds to the extension point in the main body of
     * [§7.4.1 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#normalize-data).
     *
     * The [§6 Manifest Processing][https://www.w3.org/TR/audiobooks/#audio-manifest-processing] of the Audiobooks specification does not
     * define any special data normalization step, i.e., this method returns the property value unchanged.
     *
     * @param context - 'context', i.e., the object on which the function has been invoked
     * @param term - property term
     * @param value - property value
     * @returns - the “normalized” value, or `undefined` if a fatal error occurs
    */
    normalize_data(context: PublicationManifest_Impl | RecognizedTypes_Impl, term: string, value: any): any {
        return value;
    },

    /**
     * Last step of data validation, right before empty arrays are removed and the value is returned to the main processing.
     * This corresponds to the profile extension point in the main body of
     * [§7.4.2 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#validate-data). This method implements the steps specified in
     * [§6 Manifest Processing][https://www.w3.org/TR/audiobooks/#audio-manifest-processing] of the Audiobooks specification.
     *
     * @param data - the data to be checked
     * @return - checked data (becomes, eventually, the final value of `processed` in [[generate_internal_representation]])
     */
    data_validation(data: PublicationManifest_Impl): PublicationManifest_Impl {
        return data;
    },

    /**
     * Add default values from the (possible) HTML document. This corresponds to the profile extension point in
     * [§7.4.3 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#add-html-defaults).
     *
     * The [§6 Manifest Processing][https://www.w3.org/TR/audiobooks/#audio-manifest-processing] of the Audiobooks specification does not
     * define any special defaults, i.e., this method returns the data value unchanged.
     *
     * @param global_data - global data instance, containing data like global language and direction tag, base URL, etc.
     * @param data - the (almost) final processed manifest
     * @returns - `null` if a fatal error has been raised, the original (albeit possibly modified) data otherwise.
     */
    add_default_values(data: PublicationManifest_Impl): PublicationManifest_Impl {
        return data;
    }
}
