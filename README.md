# GDD-backend
repository to host backend functionality for the GDD apps

This repository contains functionality that is only deployed for the backend. 
Currently this includes:
- [firebase function to create microscopists](#creating-microscopists)
- [firebase function to add base info when creating facilities](#creating-facilities)

### creating microscopists

When a new user is created in firebase a new entry is added to the microscopist collection with the following fields
```
    enabled: false
```


### creating facilities

When a new facility is created a firebase function runs to auto generate some data
```
    microscopists: [
      {
        name: ___NAME HERE___
      }
    ]
```

## Deployment

The functions are deployed via [github actions](./.github/workflows/firebase-functions-cd.yml). 

When changes are merged to main then the functions are deployed using the firebase-cli action to the different [firebase projects](.firebaserc)

## Contributing Guidelines

Contributions should be made by creating a fork of the repository and then make a PR against `main`.
Maintainers of the project can then review and merge these PRs.
