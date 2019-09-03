"use strict";
/**
 * Implementation classes for the Publication manifest. See 'manifest.ts' for the visible interfaces.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = require("./manifest");
// -------------------------------------------- Convenience variables -------------------------------------
const a11y_properties = [
    'accessMode',
    'accessModeSufficient',
    'accessibilityFeature',
    'accessibilityControl',
    'accessibilityHazard'
];
const creator_properties = [
    'artist',
    'author',
    'colorist',
    'contributor',
    'creator',
    'editor',
    'illustrator',
    'inker',
    'letterer',
    'penciler',
    'publisher',
    'readBy',
    'translator'
];
// -------------------------------------------- Categorization of terms -------------------------------------
/**
 * Categorization of terms per value types: arrays for terms as single literal values, multiple literal values (ie, must be turned into an array of strings),
 * single localizable string and an array of localizable strings, array of creator terms, and an array of linked resources.
 *
 * There is a method to return the full list of terms; for that to work, there is an extra array for miscellaneous terms that need otherwise special consideration (e.g., 'length')
 */
class Terms {
    constructor(single_literal, multiple_literal, single_loc_string, multiple_loc_string, multiple_creator, multiple_link, misc_terms = []) {
        this.single_literal_terms = single_literal;
        this.multiple_literal_terms = multiple_literal;
        this.single_loc_string_terms = single_loc_string;
        this.multiple_loc_string_terms = multiple_loc_string;
        this.multiple_creators_terms = multiple_creator;
        this.multiple_link_terms = multiple_link;
        this.misc_terms = misc_terms;
    }
    /**
     * Return an array of all the terms
     */
    all_terms() {
        return [
            ...this.single_literal_terms, ...this.multiple_literal_terms,
            ...this.single_loc_string_terms, ...this.multiple_loc_string_terms,
            ...this.multiple_creators_terms, ...this.multiple_link_terms,
            ...this.misc_terms
        ];
    }
}
exports.Terms = Terms;
// -------------------------------------------- The real implementations of the manifest interfaces -------------------------------------
/**
 * Creators, ie, persons or organizations
 */
class CreatorInfo_Impl {
    get name() {
        return this._name;
    }
    ;
    get type() {
        return this._type;
    }
    ;
    get id() {
        return this._id;
    }
    ;
    get url() {
        return this._url;
    }
    ;
    get identifier() {
        return this._identifier;
    }
    ;
}
/**
 * Terms used for object of this type
 */
CreatorInfo_Impl.terms = new Terms(['id', 'url'], ['type', 'identifier'], [], ['name'], [], []);
exports.CreatorInfo_Impl = CreatorInfo_Impl;
;
/**
 * Localizable Strings, i.e., string values with possible languages
 */
class LocalizableString_Impl {
    get type() {
        return this._type;
    }
    ;
    get value() {
        return this._value;
    }
    get language() {
        return this._language;
    }
    ;
}
exports.LocalizableString_Impl = LocalizableString_Impl;
;
/**
 * Linked Resources (ie, references to publication resources)
 */
class LinkedResource_Impl {
    get url() {
        return this._url;
    }
    ;
    get encodingFormat() {
        return this._encodingFormat;
    }
    ;
    get name() {
        return this._name;
    }
    ;
    get description() {
        return this._description;
    }
    ;
    get rel() {
        return this._rel;
    }
    ;
    get integrity() {
        return this._integrity;
    }
    ;
    get length() {
        return this._length;
    }
}
LinkedResource_Impl.terms = new Terms(['url', 'encodingFormat', 'integrity'], ['rel', 'type'], ['description'], ['name'], [], [], ['length']);
exports.LinkedResource_Impl = LinkedResource_Impl;
;
/**
 * The top level class for a publication manifest
 */
class PublicationManifest_Impl {
    constructor() {
        // ------------------------- The required terms
        this._type = ['CreativeWork'];
        this._id = '';
        this._name = [];
        this._readingOrder = [];
        this._readingProgression = manifest_1.ProgressionDirection.ltr;
    }
    get type() {
        return this._type;
    }
    ;
    get id() {
        return this._id;
    }
    ;
    get name() {
        return this._name;
    }
    ;
    get readingOrder() {
        return this._readingOrder;
    }
    ;
    get url() {
        return this._url;
    }
    ;
    get accessMode() {
        return this._accessMode;
    }
    get accessModeSufficient() {
        return this._accessModeSufficient;
    }
    get accessibilityFeature() {
        return this._accessibilityFeature;
    }
    get accessibilityHazard() {
        return this._accessibilityHazard;
    }
    get accessibilitySummary() {
        return this._accessibilitySummary;
    }
    get artist() {
        return this._artist;
    }
    get author() {
        return this._author;
    }
    get colorist() {
        return this._colorist;
    }
    get contributor() {
        return this._contributor;
    }
    get creator() {
        return this._creator;
    }
    get editor() {
        return this._editor;
    }
    get illustrator() {
        return this._illustrator;
    }
    get inker() {
        return this._inker;
    }
    get letterer() {
        return this._letterer;
    }
    get penciler() {
        return this._penciler;
    }
    get publisher() {
        return this._publisher;
    }
    get readBy() {
        return this._readBy;
    }
    get translator() {
        return this._translator;
    }
    get duration() {
        return this._duration;
    }
    get direction() {
        return this._direction;
    }
    get inLanguage() {
        return this._inLanguage;
    }
    get dateModified() {
        return this._dateModified;
    }
    get datePublished() {
        return this._datePublished;
    }
    get readingProgression() {
        return this._readingProgression;
    }
    get resources() {
        return this._resources;
    }
    get links() {
        return this._links;
    }
}
PublicationManifest_Impl.terms = new Terms(['dateModified', 'datePublished', 'id', 'readingProgression', 'direction'], [...a11y_properties, 'inLanguage', 'type', 'url', 'inLanguage'], ['accessibilitySummary'], ['name'], [...creator_properties], ['readingOrder', 'resources', 'links']);
exports.PublicationManifest_Impl = PublicationManifest_Impl;
;
