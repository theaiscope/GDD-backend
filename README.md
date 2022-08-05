# GDD-backend
Repository to host backend functionality for the GDD-webapp.

The backend is based on a serverless architecture using Firebase Cloud Functions.

## Testing, formatting and linting

Switch to the `functions` directory (javascript project source) before running the commands.
```shell
cd functions
```

To run the tests:
```shell
yarn test
```
> The test script will setup and start the [Firebase Emulator](https://github.com/firebase/firebase-tools#deployment-and-local-emulation) and use [Jest](https://jestjs.io/) as the test runner.

To run linting:
```shell
yarn lint
```

To auto format use prettier:
```shell
yarn prettier --write .
```

## Deployment

The functions are deployed via [github actions](./.github/workflows/firebase-functions-cd.yml). 

When changes are merged to main then the functions are deployed using the firebase-cli action to the different [firebase projects](.firebaserc)

## Contributing Guidelines

Contributions should be made by creating a fork of the repository and then make a PR against `main`.
Maintainers of the project can then review and merge these PRs.
