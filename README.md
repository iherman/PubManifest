
# Publication Manifest Processing

Implementation (with minor omissions, see below) of the Processing steps as defined in [§4 of the Publication Manifest](https://www.w3.org/TR/pub-manifest/#manifest-processing).

It is _not_ a meaningful implementation insofar as it could be embedded in a full-blown User Agent implementation based on Publication Manifests right away. _Its main purpose is to check the correctness of the specification itself_. This means that, for example, necessary checks on, e.g., the security and validity on manifest URL-s are omitted. There is also (currently) no implementation of the extraction from an HTML file or handling profile extensions. Accordingly, the "Add HTML Defaults" step ([§4.4.3](https://www.w3.org/TR/pub-manifest/#dfn-add-html-defaults)) is not implemented either. Finally, it does not have a proper user interface and only a rudimentary command line interface is available (see the [[main]] function).

## Implementation specificities

The implementation is in Typescript and on top of `node.js`.

- When the document says 'failure is returned', this appears in the code as returning the Javascript value `undefined` or, when the function returns a boolean, `false`.
- The notion of a 'context' in the algorithm is implemented via one of the `*_Impl` class instances corresponding to the TS Interface definitions for the internal representations (see [manifest](modules/_manifest_.html) and [manifest_classes](modules/_manifest_classes_.html) for details). All these classes have a reference to a [[Terms]] instance that classifies the terms defined for that class (type).

Also, the implementation is a bit more complicated than it would be in Javascript, mainly due to the requirements of Typescript.
For example, the original object, parsed from JSON, cannot be directly modified and returned as `processed`; instead, Typescript classes, duly defined as
implementing the Typescript interfaces, must be created with the key/values set.

The project can be downloaded via cloning and and can be run via the standard npm processing.

---

The documentation is also available [on-line](https://iherman.github.io/PubManifest/).

Ivan Herman (ivan@w3.org)
