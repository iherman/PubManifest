"use strict";
/**
 * Implementation classes for the Publication manifest. See 'manifest.ts' for the visible interfaces.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const manifest_1 = require("./manifest");
// -------------------------------------------- Convenience variables -------------------------------------
// A11Y properties that have arrays of literals as values
const a11y_properties = [
    'accessMode',
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
 * single localizable string and an array of localizable strings, array of entities, array of linked resources, urls, booleans, etc.
 *
 * These arrays are used in generic method calls to handle, e.g., the creation and check of arrays of localizable strings.
 *
 * There is methods to return combination of terms, used by the main algorithm: all terms that refer to arrays, to literals, resp. URL-s, in some ways (arrays or not), etc.
 *
 * The pattern used for this class is to
 *
 * - define a number of static variables for each class listing the relevant terms
 * - define a static instance of the Terms class for each class using this terms.
 *
 * The reason for this pattern is that end user, who gets an instance of, say, the Entity_Impl class implementing the Entity interface
 * can debug (e.g., dump the class into JSON) without being bothered by the various term arrays.
 *
 */
class Terms {
    /**
     * All the terms that expect arrays as values
     */
    get array_terms() {
        return [
            ...this.array_of_literals,
            ...this.array_of_strings,
            ...this.array_of_urls,
            ...this.array_of_entities,
            ...this.array_of_links,
            ...this.array_of_miscs
        ];
    }
    /**
     * All the terms that expect literals, either as individual values or arrays
     */
    get array_or_single_literals() {
        return [...this.single_literal, ...this.array_of_literals];
    }
    /**
     * All the terms that expect URLs, either as individual values or arrays
     */
    get array_or_single_urls() {
        return [...this.single_url, ...this.array_of_urls];
    }
    /**
     * All the terms that expect a single map (not an array of maps!)
     */
    get maps() {
        // This method is special; the main algorithm refers to this, although it never return anything in practice: it corresponds to the case
        // where there is a term whose value is a single map (as opposed to arrays). Such situation does not occur as of now, but
        // it may in the future...
        return [];
    }
    /**
     * All the terms
     */
    get all_terms() {
        return [
            ...this.single_literal, ...this.array_of_literals,
            ...this.array_of_strings,
            ...this.array_of_entities, ...this.array_of_links,
            ...this.single_url, ...this.array_of_urls,
            ...this.single_boolean,
            ...this.single_misc, ...this.array_of_miscs
        ];
    }
}
exports.Terms = Terms;
class EntityTerms extends Terms {
    constructor() {
        super(...arguments);
        this.single_literal = ['id'];
        this.array_of_literals = ['type', 'identifier'];
        this.array_of_strings = ['name'];
        this.array_of_entities = [];
        this.array_of_links = [];
        this.single_url = [];
        this.array_of_urls = [];
        this.single_boolean = [];
        this.single_number = [];
        this.single_misc = [];
        this.array_of_miscs = [];
    }
}
class LinkedResourceTerms extends Terms {
    constructor() {
        super(...arguments);
        this.single_literal = ['encodingFormat', 'integrity'];
        this.array_of_literals = ['rel'];
        this.array_of_strings = ['name', 'description'];
        this.array_of_entities = [];
        this.array_of_links = ['alternate'];
        this.single_url = ['url'];
        this.array_of_urls = [];
        this.single_boolean = [];
        this.single_number = ['length'];
        this.single_misc = [];
        this.array_of_miscs = [];
    }
}
class LocalizableStringTerms extends Terms {
    constructor() {
        super(...arguments);
        this.single_literal = ['value', 'language', 'direction'];
        this.array_of_literals = [];
        this.array_of_strings = [];
        this.array_of_entities = [];
        this.array_of_links = [];
        this.single_url = [];
        this.array_of_urls = [];
        this.single_boolean = [];
        this.single_number = [];
        this.single_misc = [];
        this.array_of_miscs = [];
    }
}
class PublicationManifestTerms extends Terms {
    constructor() {
        super(...arguments);
        this.single_literal = ['dateModified', 'datePublished', 'id', 'readingProgression'];
        this.array_of_literals = [...a11y_properties, 'inLanguage', 'type', 'conformsTo'];
        this.array_of_strings = ['name', 'accessibilitySummary'];
        this.array_of_entities = [...creator_properties];
        this.array_of_links = ['readingOrder', 'resources', 'links'];
        this.single_url = [];
        this.array_of_urls = ['url'];
        this.single_boolean = ['abridged'];
        this.single_number = [];
        this.single_misc = [];
        this.array_of_miscs = ['accessModeSufficient'];
    }
}
/**
 * Entities, ie, persons or organizations
 */
class Entity_Impl {
    get terms() {
        return new EntityTerms();
    }
}
exports.Entity_Impl = Entity_Impl;
;
class Person_Impl extends Entity_Impl {
}
exports.Person_Impl = Person_Impl;
;
class Organization_Impl extends Entity_Impl {
}
exports.Organization_Impl = Organization_Impl;
;
/**
 * Localizable Strings, i.e., string values with possible languages
 */
class LocalizableString_Impl {
    get terms() {
        return new LocalizableStringTerms();
    }
}
exports.LocalizableString_Impl = LocalizableString_Impl;
;
/**
 * Linked Resources (ie, references to publication resources)
 */
class LinkedResource_Impl {
    get terms() {
        return new LinkedResourceTerms();
    }
}
exports.LinkedResource_Impl = LinkedResource_Impl;
;
/**
 * The top level class for a publication manifest
 */
class PublicationManifest_Impl {
    constructor() {
        this.id = '';
        this.profile = '';
        this.readingProgression = manifest_1.ProgressionDirection.ltr;
        this.name = [];
        this.readingOrder = [];
    }
    get terms() {
        return new PublicationManifestTerms();
    }
}
exports.PublicationManifest_Impl = PublicationManifest_Impl;
;
//# sourceMappingURL=manifest_classes.js.map