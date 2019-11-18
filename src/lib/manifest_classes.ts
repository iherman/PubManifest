/**
 * Implementation classes for the Publication manifest. See 'manifest.ts' for the visible interfaces.
 */

/**
 * The core interfaces that are implemented in this module
 */
import {
    URL,
    PublicationManifest,
    LinkedResource,
    LocalizableString,
    Entity,
    Person,
    Organization,
    ProgressionDirection
} from '../manifest';

// -------------------------------------------- Convenience variables -------------------------------------
/**
 * A11Y properties that have lists of literals as values
 */
const a11y_properties = [
    'accessMode',
    'accessibilityFeature',
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
 * Categorization of terms per value types.
 *
 * A wrapper around arrays for terms as single literal values, multiple literal values (i.e., that must be turned into an array of strings),
 * single localizable string and an array of localizable strings, array of entities, array of linked resources, urls, booleans, etc. These arrays
 * are used in generic method calls to handle, e.g., the creation and check of arrays of localizable strings. There are accessors to return combination of terms, used by the main algorithm: all terms that refer to arrays, to literals, resp. URL-s, in some ways (arrays or not), etc.
 *
 * The pattern used for these classes is to
 *
 * - define a number of static variables for each implementation class, listing the relevant terms
 * - define an instance of the [[Terms]] class for each implementation class using this terms.
 *
 * The reason for this pattern is that end user, who gets an instance of, say, the [[Entity_Impl]] class implementing the [[Entity]] interface,
 * can use generic methods to check, normalize, validate, etc., term values.
 *
 */
export abstract class Terms {
    /** Terms referring to a single literal (e.g., `id`) */
    protected single_literal   : string[];

    /** Terms referring to an array (list) of literals (e.g., the terms in [[a11y_properties]]) */
    protected array_of_literals: string[];

    /** Terms referring to an array of (localizable) strings (e.g., `name`) */
    protected array_of_strings : string[];

    /** Terms referring to an array of entities (e.g., the terms in [[creator_properties]]) */
    protected array_of_entities: string[];

    /** Terms referring to an array of linked resources (e.g., `readingOrder`) */
    protected array_of_links   : string[];

    /** Terms referring to a single URL (not used at present, added as a placeholder) */
    protected single_url       : string[];

    /** Terms referring to an array of URLs (e.g., `url`) */
    protected array_of_urls    : string[];

    /** Terms referring to a single boolean (e.g., `abridged`) */
    protected single_boolean   : string[];

    /** Terms referring to a single number (e.g., `length`) */
    protected single_number    : string[];

    /** Terms referring to a single value not listed above (not used at present, added as a placeholder) */

    protected single_misc      : string[];

    /** Terms referring to an array of values not listed above (e.g., `accessModeSufficient`) */
    protected array_of_miscs   : string[];

    /**
     * Is this term's value supposed to be an array?
     */
    is_array_term(term: string): boolean {
        return [
            ...this.array_of_literals,
            ...this.array_of_strings,
            ...this.array_of_urls,
            ...this.array_of_entities,
            ...this.array_of_links,
            ...this.array_of_miscs
        ].includes(term);
    }

    /**
     * Is this term's value supposed to be an array of Entities?
     */
    is_entities_term(term: string): boolean {
        return this.array_of_entities.includes(term);
    }

    /**
     * Is this term's value supposed to be an array of localizable strings?
     */
    is_strings_term(term: string): boolean {
        return this.array_of_strings.includes(term);
    }

    /**
     * Is this term's value supposed to be an array of linked resources?
     */
    is_links_term(term: string): boolean {
        return this.array_of_links.includes(term);
    }

    /**
     * Is this term's value supposed to be a single URL?
     */
    is_single_url_term(term: string): boolean {
        return this.single_url.includes(term);
    }

    /**
     * Is this term's value supposed to be a single boolean?
     */
    is_single_boolean_term(term: string): boolean {
        return this.single_boolean.includes(term);
    }

    /**
     * Is this term's value supposed to be a single number?
     */
    is_single_number_term(term: string): boolean {
        return this.single_number.includes(term);
    }

    /**
     * Is this term's value a single or a string of literal(s)?
     */
    is_literal_or_literals_term(term: string): boolean {
        return [...this.single_literal, ...this.array_of_literals].includes(term);
    }

    /**
     * Is this term's value a single or a string of literal(s)?
     */
    is_url_or_urls_term(term: string): boolean {
        return [...this.single_url, ...this.array_of_urls].includes(term)
    }

    /**
     * Is this term's value supposed to be an array of URLs?
     */
    is_urls_term(term: string): boolean {
        return this.array_of_urls.includes(term);
    }

    /**
     * Is this term's value a regular term, ie, which does not require special handling
     */
    is_regular_term(term: string): boolean {
        return [
            ...this.single_literal, ...this.array_of_literals,
            ...this.array_of_strings,
            ...this.array_of_entities, ...this.array_of_links,
            ...this.single_url, ...this.array_of_urls,
            ...this.single_boolean
        ].includes(term);
    }

    /**
     * Is this a valid term, ie, defined by the specification
     */
    is_valid_term(term: string): boolean {
        return this.all_terms.includes(term);
    }

    /**
     * Is this term's value supposed to be map?
     * (Not used at present, added as a placeholder))
     */
    is_map_term(term: string): boolean {
        return false;
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
 * Terms defined for [[Entity]] implementations.
 */
class EntityTerms extends Terms {
    protected single_literal   : string[] = [];
    protected array_of_literals: string[] = ['type', 'identifier'];
    protected array_of_strings : string[] = ['name'];
    protected array_of_entities: string[] = [];
    protected array_of_links   : string[] = [];
    protected single_url       : string[] = ['id'];
    protected array_of_urls    : string[] = [];
    protected single_boolean   : string[] = [];
    protected single_number    : string[] = [];
    protected single_misc      : string[] = [];
    protected array_of_miscs   : string[] = [];
}

/**
 * Terms defined for [[LinkedResource]] implementations
 */
class LinkedResourceTerms extends Terms {
    protected single_literal   : string[] = ['encodingFormat', 'integrity', 'duration'];
    protected array_of_literals: string[] = ['rel'];
    protected array_of_strings : string[] = ['name', 'description'];
    protected array_of_entities: string[] = [];
    protected array_of_links   : string[] = ['alternate'];
    protected single_url       : string[] = ['url'];
    protected array_of_urls    : string[] = [];
    protected single_boolean   : string[] = [];
    protected single_number    : string[] = [];
    protected single_misc      : string[] = [];
    protected array_of_miscs   : string[] = [];
}

/**
 * Terms defined for [[LocalizableString]] implementations
 */
class LocalizableStringTerms extends Terms {
    protected single_literal   : string[] = ['value', 'language', 'direction'];
    protected array_of_literals: string[] = [];
    protected array_of_strings : string[] = [];
    protected array_of_entities: string[] = [];
    protected array_of_links   : string[] = [];
    protected single_url       : string[] = [];
    protected array_of_urls    : string[] = [];
    protected single_boolean   : string[] = [];
    protected single_number    : string[] = [];
    protected single_misc      : string[] = [];
    protected array_of_miscs   : string[] = [];
}

/**
 * Terms defined for the [[PublicationManifest]] implementations
 */
class PublicationManifestTerms extends Terms {
    protected single_literal   : string[] = ['dateModified', 'datePublished', 'readingProgression'];
    protected array_of_literals: string[] = [...a11y_properties, 'inLanguage', 'type', 'conformsTo'];
    protected array_of_strings : string[] = ['name', 'accessibilitySummary'];
    protected array_of_entities: string[] = [...creator_properties];
    protected array_of_links   : string[] = ['readingOrder', 'resources', 'links'];
    protected single_url       : string[] = ['id'];
    protected array_of_urls    : string[] = ['url'];
    protected single_boolean   : string[] = ['abridged'];
    protected single_number    : string[] = [];
    protected single_misc      : string[] = [];
    protected array_of_miscs   : string[] = ['accessModeSufficient'];
}

// -------------------------------- Type aliases for URL (which are strings, in fact) -------------


/**
 * The notion of "recognizable types" appears in the processing algorithm section, although not
 * in the main core
 */
export type RecognizedTypes_Impl = Person_Impl | Organization_Impl | LinkedResource_Impl;

/**
 * Implementation of [[Entity]], superclass for [[Person_Impl]] or [[Organization_Impl]]
 */
export class Entity_Impl implements Entity {
    /** A [[Terms]] instance referring to the terms defined for [[Entity]] */
    get terms(): Terms {
        return new EntityTerms();
    }

    type      : string[];
    name      : LocalizableString[];
    id        : string;
    url       : string;
    identifier: string[];

    [propName : string]: any;
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
    /** A [[Terms]] instance referring to the terms defined for [[LocalizableString]] */
    get terms(): Terms {
        return new LocalizableStringTerms();
    }

    value    : string;
    language : string;
    direction: string;

    [propName: string]: any;
};

/**
 * Implementation for [[LinkedResource]]
 */
export class LinkedResource_Impl implements LinkedResource {
    /** A [[Terms]] instance referring to the terms defined for [[LinkedResource]] */
    get terms(): Terms {
        return new LinkedResourceTerms();
    }

    url           : URL;
    encodingFormat: string;
    name          : LocalizableString[];
    description   : LocalizableString;
    rel           : string[];
    integrity     : string;
    duration      : string;
    alternate     : LinkedResource[];

    [propName: string]: any;
};

/**
 * Implementation for [[PublicationManifest]]
 */
export class PublicationManifest_Impl implements PublicationManifest {
    /** A [[Terms]] instance referring to the terms defined for [[PublicationManifest]] */
    get terms(): PublicationManifestTerms {
        return new PublicationManifestTerms();
    }

    type                : string[];
    id                  : URL = '';
    profile             : string = '';
    conformsTo          : string[];

    accessMode          : string[];
    accessModeSufficient: string[];
    accessibilityFeature: string[];
    accessibilityHazard : string[];
    accessibilitySummary: LocalizableString[];
    artist              : Entity[];
    author              : Entity[];
    colorist            : Entity[];
    contributor         : Entity[];
    creator             : Entity[];
    editor              : Entity[];
    illustrator         : Entity[];
    inker               : Entity[];
    letterer            : Entity[];
    penciler            : Entity[];
    publisher           : Entity[];
    readBy              : Entity[];
    translator          : Entity[];

    url                 : URL[];
    duration            : string;
    inLanguage          : string[];
    dateModified        : string;
    datePublished       : string;
    abridged            : boolean;
    readingProgression  : ProgressionDirection;
    name                : LocalizableString[] = [];
    readingOrder        : LinkedResource[] = [];
    resources           : LinkedResource[];
    links               : LinkedResource[];
    uniqueResources     : URL[];

    [propName: string]: any;
};
