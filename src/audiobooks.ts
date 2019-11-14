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

import moment from 'moment';

/** Required terms for audio books */
const required_terms = [
    'abridged',
    'accessMode',
    'accessModeSufficient',
    'accessibilityFeature',
    'accessibilityHazard',
    'accessibilitySummmary',
    'address',
    'author',
    'dateModified',
    'datePublished',
    'duration',
    'id',
    'inLanguage',
    'links',
    'name',
    'readBy',
    'readingProgression',
    'resources'
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
        if (!Global.document) {
            if (Global.document.querySelector('*[role*="doc-toc"]') !== null) {
                toc = true;
            }
        }

        if (!toc) {
            const result = processed.resources.find((link) => (link.rel && link.rel.includes('contents')));
            toc = (result !== undefined);
        }

        if (!toc) {
            Global.logger.log_validation_error('No table of content found', null, false)
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
        if (!data.readingOrder || data.readingOrder.length === 0) {
            // For an audiobook this is a fatal error
            Global.logger.log_fatal_error('No reading order for an audiobook', null, true);
            return null;
        } else if (data.readingOrder.find(isAudio) === undefined) {
            Global.logger.log_fatal_error('No audio file in reading order', null, true)
            return null;
        }

        /* Step 1.2, Remove non audio files from the reading order */
        data.readingOrder = data.readingOrder.map( (item: LinkedResource) => {
            if (isAudio(item)) {
                return item;
            } else {
                Global.logger.log_validation_error('Link in reading order is not an audio file', item, true);
                return undefined;
            }
        }).filter((item) => item !== undefined);

        /** Step 2, check the required terms */
        required_terms.forEach((term) => {
            if (!data[term]) {
                Global.logger.log_validation_error(`Term ${term} is missing from the manifest`, null, false);
            }
        })

        /** Step 3, check the recommended resources */
        {
            const res1 = (data.readingOrder) ? data.readingOrder : [];
            const res2 = (data.resources) ? data.resources : [];
            const res3 = (data.links) ? data.links: [];
            const resources = [...res1, ...res2, ...res3];
            let cover = false, a11y = false, privacy = false;
            for (let index = 0; index < resources.length; index++) {
                const rel = resources[index].rel;
                if (rel !== undefined) {
                    if (rel.includes('cover')) cover = true;
                    if (rel.includes('accessibility-report')) a11y = true;
                    if (rel.includes('privacy-policy')) privacy = true;
                }
                if (cover && a11y && privacy) break;
            }
            if (!cover) {
                Global.logger.log_validation_error('No cover resource', null, false);
            }
            if (!a11y) {
                Global.logger.log_validation_error('No accessibility report', null, false);
            }
            if (!cover) {
                Global.logger.log_validation_error('No privacy policy', null, false);
            }
        }

        /** Step 4, check the duration values */
        {
            // This is the duration in milliseconds!
            let resourceDuration: number = 0;
            data.readingOrder.forEach((link: LinkedResource) => {
                if (link.duration) {
                    resourceDuration += moment.duration(link.duration).asMilliseconds();;
                } else {
                    Global.logger.log_validation_error('No duration set in resource', link, false);
                }
            });
            if (data.duration) {
                if (moment.duration(data.duration).asMilliseconds() !== resourceDuration) {
                    Global.logger.log_validation_error(`Inconsistent global duration value (${data.duration})`, null, false);
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
     * @param global_data - global data instance, containing data like global language and direction tag, base URL, etc.
     * @param data - the (almost) final processed manifest
     * @returns - `null` if a fatal error has been raised, the original (albeit possibly modified) data otherwise.
     */
    add_default_values(data: PublicationManifest_Impl): PublicationManifest_Impl {
        return data;
    }
}
