# Test files and short overview

## 2.4 [Manifest contexts](https://www.w3.org/TR/pub-manifest/#manifest-context)

- `test_2401.json` context missing
  - Expected actions:
    - return empty
  - Expected errors:
    - Fatal error on missing context
- `test_2402.json` context incomplete
  - Expected actions:
    - return empty
  - Expected errors:
    - Fatal error on missing context

## 2.5 [Manifest Language and Direction](https://www.w3.org/TR/pub-manifest/#manifest-lang-dir)

- `test_2501.json` Set valid global language value
  - Expected actions:
    - language `"en"` set for all strings
  - Expected errors:
    - none
- `test_2502.json` Set invalid global language value
  - Expected actions:
    - no effect on output (value ignored)
  - Expected errors:
    - Validation error on incorrect BCP47 value
- `test_2503.json` Set valid global direction value
  - Expected actions:
    - direction `"ltr"` set for all strings
  - Expected errors:
    - none
- `test_2504.json` Set invalid global direction value
  - Expected actions:
    - no effect on output (value ignored)
  - Expected errors:
    - Validation error on incorrect base direction value
- `test_2505.json` Out of several (valid) language and direction setting, pick the last ones
  - Expected actions:
    - strings should be set with `"language":"en"` and `"direction":"ltr"`
  - Expected errors:
    - none

## 2.6 [Publication types](https://www.w3.org/TR/pub-manifest/#profile-types)

- TODO: CreativeWork is added by default

## 2.7 [Profile Conformance](https://www.w3.org/TR/pub-manifest/#profile-conformance)

- `test_2701.json` no conformance
  - Expected actions:
    - set profile to user agent's default
  - Expected errors:
    - Validation error on missing conformance
- `test_2702.json` no known conformance value
  - Expected actions:
    - set profile to user agent's default
  - Expected errors:
    - Validation error on no known conformance

## 2.8.16 [Duration](https://www.w3.org/TR/pub-manifest/#duration)

- `test_281601.json` Incorrect duration format
  - Expected actions:
    - "duration" should be removed from output
  - Expected errors:
    - incorrect duration format

- `test_281602.json` Correct duration
  - Expected actions:
    - "duration" value should be present in the output
  - Expected errors:
    - none

## 2.8.17-18 [Last Modification Date](https://www.w3.org/TR/pub-manifest/#last-modification-date) and [Publication Date](https://www.w3.org/TR/pub-manifest/#publication-date)

- `test_281701.json` Incorrect date format
  - Expected actions:
    - "datePublished" and "dateModified" should be removed from output
  - Expected errors:
    - incorrect publication dates
- `test_281702.json` Correct date formats
  - Expected actions:
    - "dateModified", "datePublished" values should be present in the output
  - Expected errors:
    - none

## 2.8.21 [Default Reading Order](https://www.w3.org/TR/pub-manifest/#default-reading-order)

- `test_282101.json` A single resource is turned into an array of Linked Resources
  - Expected actions:
    - `readingOrder` is an array of a single object, with the URL turned into absolute
  - Expected errors:
    - none

- `test_282102.json` Invalid URL is removed from reading order list
  - Expected actions:
    - The second entry in `readingOrder` is removed from the final list
  - Expected errors:
    - validation error on invalid URL, and a validation error on removing the corresponding Linked Resource

- `test_282103.json` URL with a fragment is removed from reading order list
  - Expected actions:
    - The second entry in `readingOrder` is removed from the final list
  - Expected errors:
    - validation error on invalid URL, and a validation error on removing the corresponding Linked Resource

- `test_282104.json` missing `readingOrder` is replaced by a default
  - Expected actions:
    - A `readingOrder` is added with a single link set to the HTML Node's Document.URL. If none provided, validation error
  - Expected errors:
    - validation error on invalid URL, and a validation error on removing the corresponding Linked Resource

- `test_282105.json` common resources between `readingOrder` and `resources`
  - Expected actions:
    - In both `readingOrder` and in `resources` the resources referring to `common1.html` and `common.html2` are removed
  - Expected errors:
    - validation error on common URL-s

- `test_282106.json` common resources between `readingOrder` and `links`
  - Expected actions:
    - In both `readingOrder` and in `links` the resources referring to `common1.html` and `common.html2` are removed
  - Expected errors:
    - validation error on common URL-s

- `test_282107.json` duplicate resources `readingOrder`
  - Expected actions:
    - The duplicate `chapter1.html` and `chapter2.html` entries are removed from  `readingOrder`
  - Expected errors:
    - validation error on duplicate entries

## 2.8.22 [Resource List](https://www.w3.org/TR/pub-manifest/#resource-list)

- `test_282201.json` A single resource is turned into an array of Linked Resources
  - Expected actions:
    - `resources` is an array of a single object, with the URL turned into absolute
  - Expected errors:
    - none

- `test_282202.json` Invalid URL is removed from reading order list
  - Expected actions:
    - The second entry in `resources` is removed from the final list
  - Expected errors:
    - validation error on invalid URL

- `test_282203.json` URL with a fragment is removed from reading order list
  - Expected actions:
    - The second entry in `resources` is removed from the final list
  - Expected errors:
    - validation error on invalid URL

- `test_282204_json` common resources between `resources` and `links`
  - Expected actions:
    - In both `resources` and in `links` the resources referring to `common1.html` and `common.html2` are removed
  - Expected errors:
    - validation error on common URL-s

- `test_282205.json` duplicate resources `resources`
  - Expected actions:
    - The duplicate  `link1.html` and `link2.html` entries are removed from  `readingOrder`
  - Expected errors:
    - validation error on duplicate entries


## 2.8.23 [Links](https://www.w3.org/TR/pub-manifest/#resource-list)

- `test_282301.json` A single resource is turned into an array of Linked Resources
  - Expected actions:
    - `links` is an array of a single object, with the URL turned into absolute
  - Expected errors:
    - none

- `test_282302.json` Invalid URL is removed from reading order list
  - Expected actions:
    - The second entry in `links` is removed from the final list
  - Expected errors:
    - validation error on invalid URL

- `test_282303.json` URL with a fragment is accepted
  - Expected actions:
    - The second entry in `links` is generated without change
  - Expected errors:
    - none

- `test_282304.json` duplicate resources `links`
  - Expected actions:
    - The duplicate `link1.html` and `link2.html` entries are removed from  `links`
  - Expected errors:
    - validation error on duplicate entries
