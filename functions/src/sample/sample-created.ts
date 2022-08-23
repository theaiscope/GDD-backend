import * as functions from 'firebase-functions'

export const onNewSampleCreated = functions
  .region('europe-west1')
  .firestore.document('samples/{sample}')
  .onCreate(async (snapshot) => {
    return `created: ${snapshot.id}`
  })
