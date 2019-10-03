/**
 * Implementation classes for the Publication manifest. See 'manifest.ts' for the visible interfaces.
 */

import { PublicationManifest, LinkedResource, LocalizableString, Entity, ProgressionDirection } from './manifest';

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
export class Terms {
    single_literal_terms: string[];
    multiple_literal_terms: string[];

    single_loc_string_terms: string[];
    multiple_loc_string_terms: string[];

    multiple_creators_terms: string[];
    multiple_link_terms: string[];

    misc_terms: string[];

    boolean_terms: string[];

    constructor(single_literal: string[], multiple_literal: string[],
                single_loc_string: string[], multiple_loc_string: string[],
                multiple_creator: string[],
                multiple_link: string[],
                boolean_terms: string[] = [],
                misc_terms: string[] = []
                ) {
        this.single_literal_terms = single_literal;
        this.multiple_literal_terms = multiple_literal;
        this.single_loc_string_terms = single_loc_string;
        this.multiple_loc_string_terms = multiple_loc_string;
        this.multiple_creators_terms = multiple_creator;
        this.multiple_link_terms = multiple_link;
        this.boolean_terms = boolean_terms;
        this.misc_terms = misc_terms;
    }

    /**
     * Return an array of all the terms
     */
    all_terms(): string[] {
        return [
            ...this.single_literal_terms, ...this.multiple_literal_terms,
            ...this.single_loc_string_terms, ...this.multiple_loc_string_terms,
            ...this.multiple_creators_terms, ...this.multiple_link_terms,
            ...this.boolean_terms,
            ...this.misc_terms
        ];
    }
}

// -------------------------------------------- The real implementations of the manifest interfaces -------------------------------------
/**
 * Creators, ie, persons or organizations
 */
export class Entity_Impl implements Entity {
    /**
     * Terms used for object of this type
     */
    static terms: Terms = new Terms(
        ['id', 'url'],
        ['type', 'identifier'],

        [],
        ['name'],

        [],
        []
    );

    _name: LocalizableString[];
    get name() {
        return this._name
    };

    _type: string[];
    get type() {
        return this._type
    };

    _id: string;
    get id() {
        return this._id
    };

    _url: string;
    get url() {
        return this._url
    };

    _identifier: string[];
    get identifier() {
        return this._identifier
    };

    [propName: string] : any;
};

/**
 * Localizable Strings, i.e., string values with possible languages
 */
export class LocalizableString_Impl implements LocalizableString {
    _type: string[];
    get type() {
        return this._type;
    };

    _value: string;
    get value() {
        return this._value;
    }

    _language: string;
    get language() {
        return this._language;
    };

    _direction: string;
    get direction() {
        return this._direction;
    };
};

/**
 * Linked Resources (ie, references to publication resources)
 */
export class LinkedResource_Impl implements LinkedResource {
    static terms: Terms = new Terms(
        ['url', 'encodingFormat', 'integrity'],
        ['rel', 'type'],

        ['description'],
        ['name'],

        [],
        [],
        ['length']
    );

    _url: string;
    get url() {
        return this._url
    };

    _encodingFormat: string;
    get encodingFormat() {
        return this._encodingFormat
    };

    _name: LocalizableString[];
    get name() {
        return this._name
    };

    _description: LocalizableString;
    get description() {
        return this._description
    };

    _rel: LocalizableString[];
    get rel() {
        return this._rel
    };

    _integrity: string;
    get integrity() {
        return this._integrity
    };

    _length: number;
    get length() {
        return this._length
    }

    [propName: string] : any;
};

/**
 * The top level class for a publication manifest
 */
export class PublicationManifest_Impl implements PublicationManifest {
    static terms: Terms = new Terms(
        ['dateModified', 'datePublished', 'id', 'readingProgression'],
        [...a11y_properties, 'inLanguage', 'type', 'url', 'inLanguage', 'conformsTo'],

        ['accessibilitySummary'],
        ['name'],

        [...creator_properties],
        ['readingOrder', 'resources', 'links'],

        ['abridged']
    );

    // ------------------------- The required terms
    _type: string[] = ['CreativeWork'];
    get type() {
        return this._type
    };

    _id: string = '';
    get id() {
        return this._id
    };

    _name: LocalizableString[] = [];
    get name() {
        return this._name
    };

    _readingOrder: LinkedResource[] = [];
    get readingOrder() {
        return this._readingOrder
    };

    _conformsTo: string[];
    get conformsTo() {
        return this._conformsTo
    };

    // ------------------------- The additional terms
    _url: string[];
    get url() {
        return this._url
    };

    _accessMode: string[];
    get accessMode() {
        return this._accessMode
    }

    _accessModeSufficient: string[];
    get accessModeSufficient() {
        return this._accessModeSufficient
    }

    _accessibilityFeature: string[];
    get accessibilityFeature() {
        return this._accessibilityFeature
    }

    _accessibilityHazard: string[];
    get accessibilityHazard() {
        return this._accessibilityHazard
    }

    _accessibilitySummary: LocalizableString[];
    get accessibilitySummary() {
        return this._accessibilitySummary
    }

    _artist: Entity[];
    get artist() {
        return this._artist
    }

    _author: Entity[];
    get author() {
        return this._author
    }

    _colorist: Entity[];
    get colorist() {
        return this._colorist
    }

    _contributor: Entity[];
    get contributor() {
        return this._contributor
    }

    _creator: Entity[];
    get creator() {
        return this._creator
    }

    _editor: Entity[];
    get editor() {
        return this._editor
    }

    _illustrator: Entity[];
    get illustrator() {
        return this._illustrator
    }

    _inker: Entity[];
    get inker() {
        return this._inker
    }

    _letterer: Entity[];
    get letterer() {
        return this._letterer
    }

    _penciler: Entity[];
    get penciler() {
        return this._penciler
    }

    _publisher: Entity[];
    get publisher() {
        return this._publisher
    }

    _readBy: Entity[];
    get readBy() {
        return this._readBy
    }

    _translator: Entity[];
    get translator() {
        return this._translator
    }

    _duration: string;
    get duration() {
        return this._duration
    }

    _inLanguage: string[];
    get inLanguage() {
        return this._inLanguage
    }

    _dateModified: string;
    get dateModified() {
        return this._dateModified
    }

    _datePublished: string;
    get datePublished() {
        return this._datePublished
    }

    _abridged: boolean;
    get abridged() {
        return this._abridged
    }

    _readingProgression: ProgressionDirection = ProgressionDirection.ltr;
    get readingProgression() {
        return this._readingProgression
    }

    _resources: LinkedResource[];
    get resources() {
        return this._resources
    }

    _links: LinkedResource[];
    get links() {
        return this._links
    }

    [propName: string] : any;
};
