import { PublicationManifest, LinkedResource, LocalizableString, CreatorInfo, TextDirection, ProgressionDirection } from './manifest';

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

export interface Terms {
    single_literal_terms: string[];
    multiple_literal_terms: string[];

    single_loc_string_terms: string[];
    multiple_loc_string_terms: string[];

    multiple_entity_terms: string[];
    multiple_link_terms: string[];

    misc_terms: string[];

    all_terms() : string[];
}

class Terms_info implements Terms {
    single_literal_terms: string[];
    multiple_literal_terms: string[];

    single_loc_string_terms: string[];
    multiple_loc_string_terms: string[];

    multiple_entity_terms: string[];
    multiple_link_terms: string[];

    misc_terms: string[];

    constructor(single_literal: string[], multiple_literal: string[],
                single_loc_string: string[], multiple_loc_string: string[],
                multiple_entity: string[],
                multiple_link: string[],
                misc_terms: string[] = []) {
        this.single_literal_terms = single_literal;
        this.multiple_literal_terms = multiple_literal;
        this.single_loc_string_terms = single_loc_string;
        this.multiple_loc_string_terms = multiple_loc_string;
        this.multiple_entity_terms = multiple_entity;
        this.multiple_link_terms = multiple_link;
        this.misc_terms = misc_terms;
    }

    all_terms(): string[] {
        return [
            ...this.single_literal_terms, ...this.multiple_literal_terms,
            ...this.single_loc_string_terms, ...this.multiple_loc_string_terms,
            ...this.multiple_entity_terms, ...this.multiple_link_terms,
            ...this.misc_terms
        ];
    }
}


export class CreatorInfo_Impl implements CreatorInfo {
    static terms: Terms = new Terms_info(
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

export class LocalizableString_Impl implements LocalizableString {
    _type: string[];
    get type() {
        return this._type
    };

    _value: string;
    get value() {
        return this._value
    }

    _language: string;
    get language() {
        return this._language
    };
};

export class LinkedResource_Impl implements LinkedResource {
    static terms: Terms = new Terms_info(
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

export class PublicationManifest_Impl implements PublicationManifest {
    static terms: Terms = new Terms_info(
        ['dateModified', 'datePublished', 'id', 'readingProgression', 'direction'],
        [...a11y_properties, 'inLanguage', 'type', 'url', 'inLanguage'],

        ['accessibilitySummary'],
        ['name'],

        [...creator_properties],
        ['readingOrder', 'resources', 'links']
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

    _artist: CreatorInfo[];
    get artist() {
        return this._artist
    }

    _author: CreatorInfo[];
    get author() {
        return this._author
    }

    _colorist: CreatorInfo[];
    get colorist() {
        return this._colorist
    }

    _contributor: CreatorInfo[];
    get contributor() {
        return this._contributor
    }

    _creator: CreatorInfo[];
    get creator() {
        return this._creator
    }

    _editor: CreatorInfo[];
    get editor() {
        return this._editor
    }

    _illustrator: CreatorInfo[];
    get illustrator() {
        return this._illustrator
    }

    _inker: CreatorInfo[];
    get inker() {
        return this._inker
    }

    _letterer: CreatorInfo[];
    get letterer() {
        return this._letterer
    }

    _penciler: CreatorInfo[];
    get penciler() {
        return this._penciler
    }

    _publisher: CreatorInfo[];
    get publisher() {
        return this._publisher
    }

    _readBy: CreatorInfo[];
    get readBy() {
        return this._readBy
    }

    _translator: CreatorInfo[];
    get translator() {
        return this._translator
    }

    _duration: string;
    get duration() {
        return this._duration
    }

    _direction: TextDirection;
    get direction() {
        return this._direction
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
