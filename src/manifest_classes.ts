/**
 * Implementation classes for the Publication manifest. See 'manifest.ts' for the visible interfaces.
 */

/**
 * The core interfaces that are implemented in this module
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

// A11Y properties that have lists of literals as values
/**
 * A11Y properties that have lists of literals as values
 */
const a11y_properties = [
    'accessMode',
    'accessibilityFeature',
    'accessibilityControl',
    'accessibilityHazard'
];

/**
 * List of creator properties (all refer to an array of [[Entity]])
 */
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
 * The pattern used for these classes is to
 *
 * - define a number of static variables for each class listing the relevant terms
 * - define a static instance of the Terms class for each class using this terms.
 *
 * The reason for this pattern is that end user, who gets an instance of, say, the Entity_Impl class implementing the Entity interface
 * can debug (e.g., dump the class into JSON) without being bothered by the various term arrays.
 *
 */
export abstract class Terms {
    /** Terms referring to a single literal (e.g., `id`) */
    single_literal:    string[];
    /** Terms referring to an array (list) of literals (e.g., the terms in [[a11y_properties]]) */
    array_of_literals: string[];
    /** Terms referring to an array of (localizable) strings (e.g., `name`) */
    array_of_strings:  string[];
    /** Terms referring to an array of entities (e.g., the terms in [[creator_properties]]) */
    array_of_entities: string[];
    /** Terms referring to an array of linked resources (e.g., `readingOrder`) */
    array_of_links:    string[];
    /** Terms referring to a single URL (not used at present, added as a placeholder) */
    single_url:        string[];
    /** Terms referring to an array of URLs (e.g., `url`) */
    array_of_urls:     string[];
    /** Terms referring to a single boolean (e.g., `abridged`) */
    single_boolean:    string[];
    /** Terms referring to a single number (e.g., `length`) */
    single_number:     string[];
    /** Terms referring to a single value not listed above (not used at present, added as a placeholder) */
    single_misc:       string[];
    /** Terms referring to an array of values not listed above (e.g., `accessModeSufficient`) */
    array_of_miscs:    string[];

    /**
     * Terms that expect arrays as values
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
     * Terms referring to literals, either as individual values or arrays
     */
    get array_or_single_literals() {
        return [...this.single_literal, ...this.array_of_literals];
    }

    /**
     * Terms referring to URLs, either as individual values or arrays
     */
    get array_or_single_urls() {
        return [...this.single_url, ...this.array_of_urls];
    }

    /**
     * Terms referring to a single map (not used at present, added as a placeholder))
     */
    get maps(): string[] {
        return [];
    }

    /**
     * All terms defined for this type
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

/**
 * Terms defined for Entities
 */
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

/**
 * Terms defined for Linked Resources
 */
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

/**
 * Terms defined for Localizable Strings
 */
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

/**
 * Terms defined for the (top level) Publication Manifest
 */
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

/**
 * This is just a type alias, i.e., a URL is simply a string, but it is better for the class documentations...
 */
export type URL = string;

/**
 * The notion of "recognizable types" appears in the processing algorithm section, although not
 * in the main core
 */
export type RecognizedTypes_Impl = Person_Impl | Organization_Impl | LinkedResource_Impl;

/**
 * Implementation of [[Entity]], superclass for [[Person_Impl]] or [[Organization_Impl]]
 */
export class Entity_Impl implements Entity {
    /** A [[Term]] instance referring to the terms defined for [[Entity]] */
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

/**
 * Implementation for a [[Person]]
 */
export class Person_Impl extends Entity_Impl  implements Person {};

/**
 * Implementation for a [[Organization]]
 */
export class Organization_Impl extends Entity_Impl  implements Organization {};

/**
 * Implementation for [[LocalizableString]]
 */
export class LocalizableString_Impl implements LocalizableString {
    /** A [[Term]] instance referring to the terms defined for [[LocalizableString]] */
    get terms(): Terms {
        return new LocalizableStringTerms();
    }

    value     : string;
    language  : string;
    direction : string;

    [propName  : string] : any;
};

/**
 * Implementation for [[LinkedResource]]
 */
export class LinkedResource_Impl implements LinkedResource {
    /** A [[Term]] instance referring to the terms defined for [[LinkedResource]] */
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
 * Implementation for [[PublicationManifest]]
 */
export class PublicationManifest_Impl implements PublicationManifest {
    /** A [[Term]] instance referring to the terms defined for [[PublicationManifest]] */
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
