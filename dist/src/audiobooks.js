"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// THIS IS JUST TO TEST THE MECHANISM!!!!
exports.audiobook_profile = {
    identifier: 'https://www.w3.org/TR/audiobooks/',
    generate_internal_representation(global_data, processed) {
        console.log(`I am in the audiobook profile!!! (${this.identifier})`);
        return processed;
    }
};
//# sourceMappingURL=audiobooks.js.map