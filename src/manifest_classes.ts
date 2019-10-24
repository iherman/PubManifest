/**
 * Implementation classes for the Publication manifest. See 'manifest.ts' for the visible interfaces.
 */

import {
    PublicationManifest,
    LinkedResource,
    LocalizableString,
    Entity,
    Person,
    Organization,
    ProgressionDirection } from './manifest';

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
export abstract class Terms {
    single_literal:    string[];
    array_of_literals: string[];
    array_of_strings:  string[];
    array_of_entities: string[];
    array_of_links:    string[];
    single_url:        string[];
    array_of_urls:     string[];
    single_boolean:    string[];
    single_number:     string[];
    single_misc:       string[];
    array_of_miscs:    string[];

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
        ]
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
    get maps(): string[] {
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

class EntityTerms extends Terms {
    single_literal:    string[] = ['id'];
    array_of_literals: string[] = ['type', 'identifier'];
    array_of_strings:  string[] = ['name'];
    array_of_entities: string[] = [];
    array_of_links:    string[] = [];
    single_url:        string[] = [];
    array_of_urls:     string[] = [];
    single_boolean:    string[] = [];
    single_number:     string[] = [];
    single_misc:       string[] = [];
    array_of_miscs:    string[] = [];
}

class LinkedResourceTerms extends Terms {
    single_literal:    string[] = ['encodingFormat', 'integrity'];
    array_of_literals: string[] = ['rel'];
    array_of_strings:  string[] = ['name', 'description'];
    array_of_entities: string[] = [];
    array_of_links:    string[] = ['alternate'];
    single_url:        string[] = ['url'];
    array_of_urls:     string[] = [];
    single_boolean:    string[] = [];
    single_number:     string[] = ['length'];
    single_misc:       string[] = [];
    array_of_miscs:    string[] = [];
}

class LocalizableStringTerms extends Terms {
    single_literal:    string[] = ['value', 'language', 'direction'];
    array_of_literals: string[] = [];
    array_of_strings:  string[] = [];
    array_of_entities: string[] = [];
    array_of_links:    string[] = [];
    single_url:        string[] = [];
    array_of_urls:     string[] = [];
    single_boolean:    string[] = [];
    single_number:     string[] = [];
    single_misc:       string[] = [];
    array_of_miscs:    string[] = [];
}

class PublicationManifestTerms extends Terms {
    single_literal:    string[] = ['dateModified', 'datePublished', 'id', 'readingProgression'];
    array_of_literals: string[] = [...a11y_properties, 'inLanguage', 'type', 'conformsTo'];
    array_of_strings:  string[] = ['name', 'accessibilitySummary'];
    array_of_entities: string[] = [...creator_properties];
    array_of_links:    string[] = ['readingOrder', 'resources', 'links'];
    single_url:        string[] = [];
    array_of_urls:     string[] = ['url'];
    single_boolean:    string[] = ['abridged'];
    single_number:     string[] = [];
    single_misc:       string[] = [];
    array_of_miscs:    string[] = ['accessModeSufficient'];
}

// -------------------------------- Type aliases for URL (which are strings, in fact) -------------

export type URL = string;
export type RecognizedTypes_Impl = Person_Impl | Organization_Impl | LinkedResource_Impl;

/**
 * Entities, ie, persons or organizations
 */
export class Entity_Impl implements Entity {
    get terms(): Terms {
        return new EntityTerms();
    }

    type       : string[];
    name       : LocalizableString[];
    id         : string;
    url        : string;
    identifier : string[];

    [propName  : string] : any;
};

export class Person_Impl extends Entity_Impl  implements Person {};
export class Organization_Impl extends Entity_Impl  implements Organization {};

/**
 * Localizable Strings, i.e., string values with possible languages
 */
export class LocalizableString_Impl implements LocalizableString {
    get terms(): Terms {
        return new LocalizableStringTerms();
    }

    value     : string;
    language  : string;
    direction : string;

    [propName  : string] : any;
};

/**
 * Linked Resources (ie, references to publication resources)
 */
export class LinkedResource_Impl implements LinkedResource {
    get terms(): Terms {
        return new LinkedResourceTerms();
    }

    url            : string;
    encodingFormat : string;
    name           : LocalizableString[];
    description    : LocalizableString;
    rel            : string[];
    integrity      : string;
    length         : number;
    alternate      : LinkedResource[];

    [propName: string] : any;
};

/**
 * The top level class for a publication manifest
 */
export class PublicationManifest_Impl implements PublicationManifest {
    get terms(): PublicationManifestTerms {
        return new PublicationManifestTerms();
    }

    type                 : string[];
    id                   : string = '';
    profile              : string = '';
    conformsTo           : string[];

    accessMode           : string[];
    accessModeSufficient : string[];
    accessibilityFeature : string[];
    accessibilityHazard  : string[];
    accessibilitySummary : LocalizableString[];
    artist               : Entity[];
    author               : Entity[];
    colorist             : Entity[];
    contributor          : Entity[];
    creator              : Entity[];
    editor               : Entity[];
    illustrator          : Entity[];
    inker                : Entity[];
    letterer             : Entity[];
    penciler             : Entity[];
    publisher            : Entity[];
    readBy               : Entity[];
    translator           : Entity[];

    url                  : string[];
    duration             : string;
    inLanguage           : string[];
    dateModified         : string;
    datePublished        : string;
    abridged             : boolean;
    readingProgression   : ProgressionDirection = ProgressionDirection.ltr;
    name                 : LocalizableString[] = [];
    readingOrder         : LinkedResource[] = [];
    resources            : LinkedResource[];
    links                : LinkedResource[];

    [propName: string] : any;
};
