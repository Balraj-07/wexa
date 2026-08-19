# Architecture notes

The API keeps a lazy official Neo4j driver and creates a short-lived session for each query, avoiding session sharing while retaining driver connection pooling. Query modules contain only parameterized Cypher. The React client calls the REST API and never receives CognoDB credentials.

`PREREQUISITE_OF` is directed from foundation to the capability it unlocks. A JavaScript → Node.js → Express.js learning path follows the relationship forward; the skill explorer follows it backward for prerequisite display.
