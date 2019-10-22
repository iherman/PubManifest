
# Testing the Publication Manifest Processing Algorithm details

This is a proof-of-concept implementation, in Typescript, and on top of `node.js`, of the processing of a [Publication Manifest](https://w3c.github.io/pub-manifest) into an implementation the finals map, as described in [§4 of the Publication Manifest specification](https://w3c.github.io/pub-manifest/#manifest-processing).

It is _not_ a meaningful implementation in so far as it could be embedded in a full-blown Pub Manifest based User Agent implementation right away. Its main purpose is to check the correctness of the specification itself. In particular, it does not have a proper user interface or command line interface (yet?)

Status 2019-10-22: the implementation is there, but only partially tested.



---

Ivan Herman (ivan@w3.org)
