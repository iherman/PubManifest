"use strict";
/**
 * Module implementing the audiobook profile specific extension functions.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Audiobook profile file instance. See [[Profile]] for the generic specification of this class;
 */
exports.audiobook_profile = {
    identifier: 'https://www.w3.org/TR/audiobooks/',
    generate_internal_representation(global_data, processed) {
        return processed;
    },
    normalize_data(global_data, context, term, value) {
        return value;
    },
    data_validation(global_data, data) {
        return data;
    },
    add_default_values(global_data, data, document) {
        return data;
    }
};
//# sourceMappingURL=audiobooks.js.map