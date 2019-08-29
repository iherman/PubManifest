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

// export interface Terms {
//     single_literal_terms: string[];
//     multiple_literal_terms: string[];

//     single_loc_string_terms: string[];
//     multiple_loc_string_terms: string[];

//     multiple_entity_terms: string[];
//     multiple_link_terms: string[];

//     [propName: string]    : any;
// }


export class CreatorInfo_Impl implements CreatorInfo {
    // single_literal_terms: string[] = ['dateModified', 'datePublished', 'id', 'inDirection', 'readingProgression'];
    // multiple_literal_terms: string[] = [...a11y_properties, 'inLanguage', 'type', 'url'];

    // single_loc_string_terms: string[] = ['accessibilitySummary']
    // multiple_loc_string_terms: string[] = ['name'];

    // multiple_entity_terms: string[] = [...creator_properties];
    // multiple_link_terms: string[] = ['readingOrder', 'resources', 'links'];

    constructor(person_organization: LocalizableString[]) { this._name = person_organization };
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
};

export class LocalizableString_Impl implements LocalizableString {
    constructor(value: string) { this._value = value }
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
    // single_literal_terms: string[] = ['dateModified', 'datePublished', 'id', 'inDirection', 'readingProgression'];
    // multiple_literal_terms: string[] = [...a11y_properties, 'inLanguage', 'type', 'url'];

    // single_loc_string_terms: string[] = ['accessibilitySummary']
    // multiple_loc_string_terms: string[] = ['name'];

    // multiple_entity_terms: string[] = [...creator_properties];
    // multiple_link_terms: string[] = ['readingOrder', 'resources', 'links'];

    constructor(url: string) { this._url = url }
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
    // [propName: string] : any;
};

export class PublicationManifest_Impl implements PublicationManifest {

    static single_literal_terms: string[] = ['dateModified', 'datePublished', 'id', 'inDirection', 'readingProgression'];
    static multiple_literal_terms: string[] = [...a11y_properties, 'inLanguage', 'type', 'url'];

    static single_loc_string_terms: string[] = ['accessibilitySummary']
    static multiple_loc_string_terms: string[] = ['name'];

    static multiple_entity_terms: string[] = [...creator_properties];
    static multiple_link_terms: string[] = ['readingOrder', 'resources', 'links'];

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

    _inLanguage: string;
    get inLanguage() {
        return this._inLanguage
    }

    _inDirection: TextDirection;
    get inDirection() {
        return this._inDirection
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

    [propName: string]    : any;
};
