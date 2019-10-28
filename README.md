
# Publication Manifest Processing

This is a proof-of-concept implementation, in Typescript and on top of `node.js`, of processing a [Publication Manifest](https://w3c.github.io/pub-manifest) into an implementation of the finals  “map” (i.e., a Typescript class instance), as described in [§4 of the Publication Manifest specification](https://w3c.github.io/pub-manifest/#manifest-processing).

It is _not_ a meaningful implementation insofar as it could be embedded in a full-blown Pub Manifest based User Agent implementation right away. Its main purpose is to check the correctness of the specification itself. In particular, it does not have a proper user interface and only a rudimentary command line interface.

The (only) API function is described in the documentation (see [[generate_representation]]).

Status 2019-10-27: the implementation is there, but not yet fully tested.



---

Ivan Herman (ivan@w3.org)
