
# Publication Manifest Processing

Implementation (with minor omissions, see below) of the Processing steps as defined in [§7 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#manifest-processing).

It is _not_ a meaningful implementation insofar as it could be embedded in a full-blown User Agent implementation based on Publication Manifests right away. _Its main purpose is to check the correctness of the specification itself_. This means that, for example, necessary checks on, e.g., the security and validity on the URL-s in the manifest are omitted.  It does not have a proper user interface and only a rudimentary command line interface is used.

The following public functions are available:

- The [[discover_manifest]] function, implementing the manifest discovery, returning a manifest (text);
- The [[generate_internal_representation]] function, implementing the processing algorithm itself and resulting in a class implementing the [[PublicationManifest]] interface;
- The [[process_manifest]] function, a wrapper of around the combination of the two previous functions to provide a single entry point.

There is also a rudimentary CLI implemented in the separate [runner](modules/_tests_runner_) module. That is for testing only.

## Implementation specificities

The implementation is in Typescript and on top of `node.js`.

- When the document says 'failure is returned', this appears in the code as returning the Javascript value `undefined` or, when the function returns a boolean, `false`.
- The notion of a 'context' in the algorithm is implemented via one of the `*_Impl` interfaces corresponding to the TS Interface definitions for the internal representations (see [manifest](modules/_manifest_.html) and [terms](modules/_terms_.html) for details). All these classes have a reference to a [[Terms]] instance that classifies the terms defined for that class (type).


The project can be downloaded via cloning and and can be run via the standard `npm` processing.

---

The documentation is also available [on-line](https://iherman.github.io/PubManifest/docs/).

Ivan Herman (ivan@w3.org)
