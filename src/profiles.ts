const misc_arrays_properties = [
    'type',
    'rel'
];

const a11y_properties = [
    'accessMode',
    'accessModeSufficient',
    'accessibilityAPI',
    'accessibilityControl',
    'accessibilityFeature',
    'accessibilityHazard'
];

const creator_properties = [
    'artist',
    'author',
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

const resource_categorization_properties = [
    'readingOrder',
    'resources',
    'links'
];

export const core_profile = {
//    array_values        : [...misc_arrays_properties, ...a11y_properties, ...creator_properties, ...resource_categorization_properties],
    entity_values       : [...creator_properties],
    local_string_values : ['description', 'name', 'accessibilitySummary'],
    url_values          : ['url', 'id'],

    string_values       : ['type', 'inLanguage', 'in'],

    link_values         : [...resource_categorization_properties],
};
