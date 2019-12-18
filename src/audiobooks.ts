/**
 * Module implementing the audiobook profile specific extension functions. The specificities of this profile are defined in [§6 Manifest Processing][https://www.w3.org/TR/audiobooks/#audio-manifest-processing] of the Audiobooks specification.
 *
 */

 /** The main interface defining what a Profile is for this implementation */
import { Profile } from './lib/profile';

/** Global data class */
import { Global, check_duration_value, toc_query_selector } from './lib/utilities';

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
} from './lib/terms';

import moment from 'moment';

/** Required terms for audio books */
// TODO add `links` if that term is indeed required; temporarily removed it.
const required_terms = [
    'abridged',
    'accessMode',
    'accessModeSufficient',
    'accessibilityFeature',
    'accessibilityHazard',
    'accessibilitySummary',
    'author',
    'dateModified',
    'datePublished',
    'id',
    'inLanguage',
    'name',
    'readBy',
    'readingProgression',
    'resources',
    'url',
]

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
     * is available either as part of the PEP (if applicable) or in the resource list.
     *
     * @param processed - the generated manifest representation
     * @returns - the same object as `processed`, with possible additions
     */
    generate_internal_representation(processed: PublicationManifest): PublicationManifest {
        let toc: boolean = false;
        if (Global.document !== undefined) {
            if (Global.document.querySelector(toc_query_selector) !== null) {
                toc = true;
            }
        }

        if (!toc && processed.resources) {
            const result = processed.resources.find((link) => (link.rel && link.rel.includes('contents')));
            toc = (result !== undefined);
        }

        if (!toc) {
            Global.logger.log_light_validation_error('No table of content found')
        }

        // The PEP (if it exists) should also be in the unique resources array.
        // @@@@@@@@@@@@!!!!!! This is not yet accepted, just a proposed amendment of the audiobook spec!
        if (Global.document !== undefined) {
            if (!processed.uniqueResources.includes(Global.document.documentURI)) {
                processed.uniqueResources.push(Global.document.documentURI);
            }
        }

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
     * Note: "checking whether the link refers to an audio file" means checking the encoding format (a.k.a. media type) which should start with `audio/`. More
     * sophisticated applications may try to look into the file itself, but this is good enough for this testing application.
     *
     * @param data - the data to be checked
     * @return - checked data (becomes, eventually, the final value of `processed` in [[generate_internal_representation]]). If a fatal error is raised, return null.
     */
    data_validation(data: PublicationManifest_Impl): PublicationManifest_Impl {
        const isAudio = (link: LinkedResource): boolean => {
            if (link.encodingFormat) {
                return link.encodingFormat.startsWith('audio/');
            } else {
                // No encoding format set
                return false;
            }
        };

        /* Step 1.1, check if the reading order is not empty and contains at least one audio file */
        if (data.readingOrder === undefined) {
            // For an audiobook this is a fatal error
            Global.logger.log_fatal_error('No reading order for an audiobook');
            return null;
        }

        /* Step 1.2, Remove non audio files from the reading order */
        data.readingOrder = data.readingOrder.map((item: LinkedResource) => {
            if (isAudio(item)) {
                return item;
            } else {
                Global.logger.log_strong_validation_error('Link in reading order is not an audio file', item);
                return undefined;
            }
        }).filter((item) => item !== undefined);

        /* Step 1.3, if reading order becomes empty after the previous step, this is a fatal error */
        if (data.readingOrder.length === 0) {
            Global.logger.log_fatal_error('Empty reading order for an audiobook');
            return null;
        }

        /** Step 2, set the default type, if necessary */
        if (!data.type) {
            Global.logger.log_light_validation_error(`Missing publication type for Audiobooks (set default)`);
            data.type = ["Audiobook"]
        }

        /** Step 3, check the required terms */
        required_terms.forEach((term) => {
            if (data[term] === undefined) {
                Global.logger.log_light_validation_error(`Term "${term}" is missing from the manifest`);
            }
        })

        /** Step 4, check the recommended resources */
        {
            const res1 = (data.readingOrder) ? data.readingOrder : [];
            const res2 = (data.resources) ? data.resources : [];
            const cover = [...res1, ...res2].find((item: LinkedResource): boolean => {
                return item.rel && item.rel.includes('cover');
            });
            if (cover === undefined) {
                Global.logger.log_light_validation_error('No cover resource');
            }
        }

        /** Step 5, check the duration values */
        {
            // This is the duration in milliseconds!
            let resourceDuration: number = 0;
            data.readingOrder.forEach((resource: LinkedResource) => {
                if (resource.duration) {
                    if (!check_duration_value(resource.duration, Global.logger)) {
                        delete resource.duration
                    } else {
                        resourceDuration += moment.duration(resource.duration).asMilliseconds();;
                    }
                } else {
                    Global.logger.log_light_validation_error('No duration set in resource', resource);
                }
            });
            if (data.duration) {
                if (moment.duration(data.duration).asMilliseconds() !== resourceDuration) {
                    Global.logger.log_light_validation_error(`Inconsistent global duration value (${data.duration})`);
                }
            }
        }
        return data;
    },

    /**
     * Add default values from the (possible) HTML document. This corresponds to the profile extension point in
     * [§7.4.3 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#add-html-defaults).
     *
     * The [§6 Manifest Processing][https://www.w3.org/TR/audiobooks/#audio-manifest-processing] of the Audiobooks specification does not
     * define any special defaults, i.e., this method returns the data value unchanged.
     *
     * @param data - the (almost) final processed manifest
     * @returns - `null` if a fatal error has been raised, the original (albeit possibly modified) data otherwise.
     */
    add_default_values(data: PublicationManifest_Impl): PublicationManifest_Impl {
        return data;
    },

    /**
     * Look for a (possible) TOC element in the PEP, if present, and return it if found. This ToC element should preempt
     * any other search for the ToC element.
     *
     * @param manifest - the generated manifest (by that point all manifest processing, cleanup, etc, is done)
     * @returns - the ToC element, if found, `null` otherwise
     */
    get_toc_element(data: PublicationManifest): HTMLElement {
        return (Global.document !== undefined) ? Global.document.querySelector(toc_query_selector) : null;
    }
}
