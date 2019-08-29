"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Canonical {
    constructor() {
        this.readingOrder = [];
        this.name = [];
        this.type = [];
        this.id = '';
        this.manifest_object = {};
    }
    get accessMode() {
        return this._accessMode;
    }
    static create_canonical(manifest) {
        const retval = new Canonical();
        retval._accessMode = [manifest];
        return retval;
    }
}
exports.Canonical = Canonical;
