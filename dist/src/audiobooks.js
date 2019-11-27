"use strict";
/**
 * Module implementing the audiobook profile specific extension functions. The specificities of this profile are defined in [§6 Manifest Processing][https://www.w3.org/TR/audiobooks/#audio-manifest-processing] of the Audiobooks specification.
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** Global data class */
const utilities_1 = require("./lib/utilities");
const moment_1 = __importDefault(require("moment"));
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
];
/**
 * Audiobook profile file instance. See [[Profile]] for the generic specification of this class;
 */
exports.audiobook_profile = {
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
    generate_internal_representation(processed) {
        let toc = false;
        if (utilities_1.Global.document !== undefined) {
            if (utilities_1.Global.document.querySelector('*[role*="doc-toc"]') !== null) {
                toc = true;
            }
        }
        if (!toc && processed.resources) {
            const result = processed.resources.find((link) => (link.rel && link.rel.includes('contents')));
            toc = (result !== undefined);
        }
        if (!toc) {
            utilities_1.Global.logger.log_light_validation_error('No table of content found');
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
    normalize_data(context, term, value) {
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
    data_validation(data) {
        const isAudio = (link) => {
            if (link.encodingFormat) {
                return link.encodingFormat.startsWith('audio/');
            }
            else {
                // No encoding format set
                return false;
            }
        };
        /* Step 1.1, check if the reading order is not empty and contains at least one audio file */
        if (data.readingOrder === undefined) {
            // For an audiobook this is a fatal error
            utilities_1.Global.logger.log_fatal_error('No reading order for an audiobook');
            return null;
        }
        /* Step 1.2, Remove non audio files from the reading order */
        data.readingOrder = data.readingOrder.map((item) => {
            if (isAudio(item)) {
                return item;
            }
            else {
                utilities_1.Global.logger.log_strong_validation_error('Link in reading order is not an audio file', item);
                return undefined;
            }
        }).filter((item) => item !== undefined);
        /* Step 1.3, if reading order becomes empty after the previous step, this is a fatal error */
        if (data.readingOrder.length === 0) {
            utilities_1.Global.logger.log_fatal_error('Empty reading order for an audiobook');
            return null;
        }
        /** Step 2, set the default type, if necessary */
        if (!data.type) {
            utilities_1.Global.logger.log_light_validation_error(`Missing publication type for Audiobooks (set default)`);
            data.type = ["Audiobook"];
        }
        /** Step 3, check the required terms */
        required_terms.forEach((term) => {
            if (data[term] === undefined) {
                utilities_1.Global.logger.log_light_validation_error(`Term "${term}" is missing from the manifest`);
            }
        });
        /** Step 4, check the recommended resources */
        {
            const res1 = (data.readingOrder) ? data.readingOrder : [];
            const res2 = (data.resources) ? data.resources : [];
            const cover = [...res1, ...res2].find((item) => {
                return item.rel && item.rel.includes('cover');
            });
            if (cover === undefined) {
                utilities_1.Global.logger.log_light_validation_error('No cover resource');
            }
        }
        /** Step 5, check the duration values */
        {
            // This is the duration in milliseconds!
            let resourceDuration = 0;
            data.readingOrder.forEach((resource) => {
                if (resource.duration) {
                    if (!utilities_1.check_duration_value(resource.duration, utilities_1.Global.logger)) {
                        delete resource.duration;
                    }
                    else {
                        resourceDuration += moment_1.default.duration(resource.duration).asMilliseconds();
                        ;
                    }
                }
                else {
                    utilities_1.Global.logger.log_light_validation_error('No duration set in resource', resource);
                }
            });
            if (data.duration) {
                if (moment_1.default.duration(data.duration).asMilliseconds() !== resourceDuration) {
                    utilities_1.Global.logger.log_light_validation_error(`Inconsistent global duration value (${data.duration})`);
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
    add_default_values(data) {
        return data;
    }
};
//# sourceMappingURL=audiobooks.js.map