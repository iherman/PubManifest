
# Publication Manifest Processing

Implementation (with minor omissions, see below) of the Processing steps as defined in [§7 of the Publication Manifest Specification](https://www.w3.org/TR/pub-manifest/#manifest-processing), the ToC extraction algorithm as defined in [§C.3 of the Publication Manifest Specification](https://www.w3.org/TR/pub-manifest/#app-toc-ua), and the extension to the core algorithm as defined in [§6 of the Audiobook Specification](https://www.w3.org/TR/audiobooks/#audio-manifest-processing).

It is _not_ a meaningful implementation insofar as it should be embedded in a full-blown User Agent implementation based on Publication Manifests to make it useful. _Its main purpose is to check the correctness of the specifications themselves_. This means that, for example, necessary checks on, e.g., the security and validity on the URL-s in the manifest are omitted.

The following public functions are available:

- The [[discover_manifest]] function, implementing the manifest discovery, returning a manifest (text);
- The [[generate_internal_representation]] function, implementing the processing algorithm itself and resulting in a class implementing the [[PublicationManifest]] interface;
- The [[process_manifest]] function, a wrapper of around the combination of the two previous functions to provide a single entry point.

There is a rudimentary CLI implemented in the separate [runner](modules/_tests_runner_) module for testing only. There is also a [“webview”](https://iherman.github.io/PubManifest/webview/index.html) where the user can upload, or type in, manifests and see the resulting data structure.

## Implementation specificities

The implementation is in Typescript and on top of `node.js`.

- When the document says 'failure is returned', this appears in the code as returning the Javascript value `undefined` or, when the function returns a boolean, `false`.
- The notion of a 'context' in the algorithm is implemented via one of the `*_Impl` interfaces corresponding to the TS Interface definitions for the internal representations (see [manifest](modules/_manifest_.html) and [terms](modules/_terms_.html) for details). All these classes have a reference to a [[Terms]] instance that classifies the terms defined for that class (type).


The project can be downloaded via cloning and and can be run via the standard `npm` processing.

---

The documentation is also available [on-line](https://iherman.github.io/PubManifest/docs/index.html).

Ivan Herman (ivan@w3.org)
