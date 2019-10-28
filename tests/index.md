# Test files and short overview

## 2.4 [Manifest contexts](https://www.w3.org/TR/pub-manifest/#manifest-context)

- `test_2401.jsonld` Missing Context
  - Expected actions:
    - return empty
  - Expected errors:
    - Fatal error on missing context
- `test_2402.jsonld` context incomplete
  - Expected actions:
    - return empty
  - Expected errors:
    - Fatal error on missing context

## 2.5 [Manifest Language and Direction](https://www.w3.org/TR/pub-manifest/#manifest-lang-dir)

- `test_2501.jsonld` Set valid global language value
  - Expected actions:
    - language `"en"` set for all strings
  - Expected errors:
    - none
- `test_2502.jsonld` Set invalid global language value
  - Expected actions:
    - no effect on output (value ignored)
  - Expected errors:
    - Validation error on incorrect BCP47 value
- `test_2503.jsonld` Set valid global direction value
  - Expected actions:
    - direction `"ltr"` set for all strings
  - Expected errors:
    - none
- `test_2504.jsonld` Set invalid global direction value
  - Expected actions:
    - no effect on output (value ignored)
  - Expected errors:
    - Validation error on incorrect base direction value
- `test_2505.jsonld` Out of several (valid) language and direction setting, pick the last ones
  - Expected actions:
    - strings should be set with `"language":"en"` and `"direction":"ltr"`
  - Expected errors:
    - none

## 2.6 [Publication types](https://www.w3.org/TR/pub-manifest/#profile-types)

- `test_2601.jsonld` No `type` set
  - Expected actions:
    - the `CreativeWork` type should be added
  - Expected errors:
    - Validation error (no type)

- `test_2601.jsonld` `CreativeWork` type is not set, only `Book`
  - Expected actions:
    - no change on the document
  - Expected errors:
    - None


## 2.7 [Profile Conformance](https://www.w3.org/TR/pub-manifest/#profile-conformance)

- `test_2701.jsonld` no conformance
  - Expected actions:
    - set profile to user agent's default
  - Expected errors:
    - Validation error on missing conformance
- `test_2702.jsonld` no known conformance value
  - Expected actions:
    - set profile to user agent's default
  - Expected errors:
    - Validation error on no known conformance

## 2.8.1.1 [Abridged]((https://www.w3.org/TR/pub-manifest/#abridged))

- `test_281101.jsonld` Check invalid value for `abridged`
  - Expected actions:
    - the value of `abridged` should be removed from the result
  - Expected error:
    - validation error on `abridged`

## 2.8.1.2. [Accessibility](https://www.w3.org/TR/pub-manifest/#accessibility)

- `test_281201.jsonld` Check the simple a11y terms
  - Expected actions:
    - All values should be turned into arrays of literals
  - Expected error: none

- `test_281202.jsonld` Separate test on `accessModeSufficient`: invalid input
  - Expected actions:
    - The illegal value ("visual") should be removed, the valid one stays
  - Expected error:
    - Validation error on the incorrect data

- `test_281203.jsonld` Separate test on `accessModeSufficient`: only invalid input
  - Expected actions:
    - Both values being invalid, the key should be removed altogether
  - Expected error:
    - Validation error on the incorrect data

## 2.8.1.3 [Address](https://www.w3.org/TR/pub-manifest/#address)

- `test_281301.jsonld` Turn relative URL into absolute
  - Expected actions:
    - Value of URL should be absolute
  - Expected error: none

- `test_281302.jsonld` Turn all relative URLs into absolute
  - Expected actions:
    - Value of all URLs should be absolute
  - Expected error: none

- `test_281303.jsonld` Invalid URL
  - Expected actions:
    - The invalid URL should be removed
  - Expected error: none
    - Validation error on the URL

## 2.8.1.4 [Canonical Identifier](https://www.w3.org/TR/pub-manifest/#canonical-identifier)

- `test_281401.jsonld` Invalid URL for ID
  - Expected actions:
    - Value of invalid URL should be removed
  - Expected error:
    - Validation error on the URL

- `test_281402.jsonld` Missing ID
  - Expected actions:
    - Output unchanged
  - Expected error:
    - Validation error on the missing ID

## 2.8.1.6 [Duration](https://www.w3.org/TR/pub-manifest/#duration)

- `test_281601.jsonld` Incorrect duration format
  - Expected actions:
    - "duration" should be removed from output
  - Expected errors:
    - incorrect duration format

- `test_281602.jsonld` Correct duration
  - Expected actions:
    - "duration" value should be present in the output
  - Expected errors:
    - none

## 2.8.1.7-1.8 [Last Modification Date](https://www.w3.org/TR/pub-manifest/#last-modification-date) and [Publication Date](https://www.w3.org/TR/pub-manifest/#publication-date)

- `test_281701.jsonld` Incorrect date format
  - Expected actions:
    - "datePublished" and "dateModified" should be removed from output
  - Expected errors:
    - incorrect publication dates
- `test_281702.jsonld` Correct date formats
  - Expected actions:
    - "dateModified", "datePublished" values should be present in the output
  - Expected errors:
    - none

## 2.8.21 [Default Reading Order](https://www.w3.org/TR/pub-manifest/#default-reading-order)

- `test_282101.jsonld` A single resource is turned into an array of Linked Resources
  - Expected actions:
    - `readingOrder` is an array of a single object, with the URL turned into absolute
  - Expected errors:
    - none

- `test_282102.jsonld` Invalid URL is removed from reading order list
  - Expected actions:
    - The second entry in `readingOrder` is removed from the final list
  - Expected errors:
    - validation error on invalid URL, and a validation error on removing the corresponding Linked Resource

- `test_282103.jsonld` URL with a fragment is removed from reading order list
  - Expected actions:
    - The second entry in `readingOrder` is removed from the final list
  - Expected errors:
    - validation error on invalid URL, and a validation error on removing the corresponding Linked Resource

- `test_282104.jsonld` missing `readingOrder` is replaced by a default
  - Expected actions:
    - A `readingOrder` is added with a single link set to the HTML Node's Document.URL. If none provided, validation error
  - Expected errors:
    - validation error on invalid URL, and a validation error on removing the corresponding Linked Resource

- `test_282105.jsonld` common resources between `readingOrder` and `resources`
  - Expected actions:
    - In both `readingOrder` and in `resources` the resources referring to `common1.html` and `common.html2` are removed
  - Expected errors:
    - validation error on common URL-s

- `test_282106.jsonld` common resources between `readingOrder` and `links`
  - Expected actions:
    - In both `readingOrder` and in `links` the resources referring to `common1.html` and `common.html2` are removed
  - Expected errors:
    - validation error on common URL-s

- `test_282107.jsonld` duplicate resources `readingOrder`
  - Expected actions:
    - The duplicate `chapter1.html` and `chapter2.html` entries are removed from  `readingOrder`
  - Expected errors:
    - validation error on duplicate entries

## 2.8.22 [Resource List](https://www.w3.org/TR/pub-manifest/#resource-list)

- `test_282201.jsonld` A single resource is turned into an array of Linked Resources
  - Expected actions:
    - `resources` is an array of a single object, with the URL turned into absolute
  - Expected errors:
    - none

- `test_282202.jsonld` Invalid URL is removed from reading order list
  - Expected actions:
    - The second entry in `resources` is removed from the final list
  - Expected errors:
    - validation error on invalid URL

- `test_282203.jsonld` URL with a fragment is removed from reading order list
  - Expected actions:
    - The second entry in `resources` is removed from the final list
  - Expected errors:
    - validation error on invalid URL

- `test_282204_json` common resources between `resources` and `links`
  - Expected actions:
    - In both `resources` and in `links` the resources referring to `common1.html` and `common.html2` are removed
  - Expected errors:
    - validation error on common URL-s

- `test_282205.jsonld` duplicate resources `resources`
  - Expected actions:
    - The duplicate  `link1.html` and `link2.html` entries are removed from  `readingOrder`
  - Expected errors:
    - validation error on duplicate entries

## 2.8.23 [Links](https://www.w3.org/TR/pub-manifest/#resource-list)

- `test_282301.jsonld` A single resource is turned into an array of Linked Resources
  - Expected actions:
    - `links` is an array of a single object, with the URL turned into absolute
  - Expected errors:
    - none

- `test_282302.jsonld` Invalid URL is removed from reading order list
  - Expected actions:
    - The second entry in `links` is removed from the final list
  - Expected errors:
    - validation error on invalid URL

- `test_282303.jsonld` URL with a fragment is accepted
  - Expected actions:
    - The second entry in `links` is generated without change
  - Expected errors:
    - none

- `test_282304.jsonld` duplicate resources `links`
  - Expected actions:
    - The duplicate `link1.html` and `link2.html` entries are removed from  `links`
  - Expected errors:
    - validation error on duplicate entries
