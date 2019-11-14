"use strict";
/**
 * Generic module to implement publication profiles. It defines a generic interface and an 'empty' profile; the latter can be used
 * as some sort of a default profile with, essentially, empty extension functions.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default profile: all methods are empty, i.e., simply return the incoming values. See [[Profile]] for the details of the method
 * specifications.
 */
exports.default_profile = {
    identifier: 'https://www.w3.org/TR/pub-manifest/',
    generate_internal_representation(processed) {
        return processed;
    },
    normalize_data(context, term, value) {
        return value;
    },
    data_validation(data) {
        return data;
    },
    add_default_values(data) {
        return data;
    }
};
//# sourceMappingURL=profile.js.map