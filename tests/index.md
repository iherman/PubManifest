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




