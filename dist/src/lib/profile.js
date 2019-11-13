"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default_profile = {
    identifier: 'https://www.w3.org/TR/pub-manifest/',
    generate_internal_representation(global_data, processed) {
        console.log(`I am in the internal profile!! (${this.identifier})`);
        return processed;
    }
};
//# sourceMappingURL=profile.js.map