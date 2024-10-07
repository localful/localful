---

<div align="center">
<p><b>⚠️ Under Active Development ⚠️</b></p>
<p>This project is early in development and not yet ready for general use.<br>
Expect bugs, missing docs, incomplete features etc!</p>
</div>

---

<br/>
<div align="center">
  <h1>Localful</h1>
  <p>Full-stack tooling for building local-first web apps with a focus on simplicity, interoperability and longevity.</p>
  <a href="./docs/quick-start.md">Quick Start</a> |
  <a href="./docs/README.md">Documentation</a> |
  <a href="./docs/examples.md">Examples</a> |
  <a href="https://github.com/localful/localful/issues/6">Roadmap</a>
</div>  
<br/>


There are lots of tools to help you develop local-first web applications, however these often require building around CRDTs, eventual consistency, conflict resolution and other concepts
which fundamentally change how you build apps, and how you store and manage data.  
These concepts are incredibly powerful and useful when needed, but can introduce a new world of complexity for both developers and end users when your use case doesn't require them.

Localful provides a pragmatic and approachable solution for developing local-fist web applications by creating
immutable versions when data is changed. To learn more, you can view the [overview docs](./docs/overview.md).


## Key Features
- "Device" library for the web which includes:
  - The ability to define a data schema for your application, including support for schema and data migrations.
  - Local-first storage using IndexDB.
  - Client-side encryption, including locally at rest.
  - Basic data queries with support for filtering, ordering, grouping etc.
  - Built-in reactivity for local data fetching using [Observables](https://rxjs.dev/) which allows for easy integration with frameworks like React.
- Self-hosted Node.js server which includes:
  - Data backup and cross-device synchronisation features.
  - Traditional user account system (using email & password) for controlling ability to manage and use the server.
  - The ability to completely disable user registration to allow for personal-only use.
- Working with Localful:
  - The device library can be used without connecting to a server, that is the whole point of local-first after all!
  - A single server instance is currently designed to support a single web app.

## Contributions

Feel free to suggest features, give feedback, suggest improvements, raise bugs, open PRs and anything else.

## License

This project is released under the [GNU AGPLv3 license](LICENSE.txt).

