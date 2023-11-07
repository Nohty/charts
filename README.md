# Charts Library

The `charts` library is a robust and straightforward library for creating charts using HTML5 canvas, designed with a focus on simplicity and performance. It does not rely on any third-party dependencies.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Build Commands](#build-commands)
- [Dependencies](#dependencies)
- [License](#license)
- [Setting Up for Development](#setting-up-for-development)
- [Contribution](#contribution)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [TypeScript](https://www.typescriptlang.org/)

### Installation

1. Clone the repository:

```sh
git clone <repository_url>
```

2. Install NPM packages:

```sh
npm install
```

3. Build the library:

```sh
npm run build
```

## Build Commands

- `build`: Compiles the TypeScript files to JavaScript in the `dist` directory.
- `build:watch`: Monitors the `src` directory for changes and recompiles files as needed.
- `build:all`: Builds both the `charts` library and the `example` project.

## Dependencies

- **Local Dependencies**: The `charts` library is a local dependency for the `example` project.
- **DevDependencies**: TypeScript is a development dependency, crucial for the build process of the library.

## License

The `charts` library is released under the [GNU General Public License v3.0](LICENSE).

## Setting Up for Development

To set up the `charts` library for development:

1. Clone the repository as mentioned [above](#installation).
2. Navigate to the project directory and run the installation command.
3. Use the build commands to compile the source code.

## Contribution

Contributions are welcome! For any enhancements, bug fixes, or feature requests, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/AmazingFeature`).
3. Commit your changes.
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.
