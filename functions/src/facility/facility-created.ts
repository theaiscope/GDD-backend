import * as functions from 'firebase-functions'

export const onNewFacilityCreated = functions
  .region('europe-west1')
  .firestore.document('facilities/{facility}')
  .onCreate(async (snapshot) => {
    return snapshot.ref
      .set({
        microscopists: [],
        name: '___NAME HERE___',
      })
      .then(function () {
        functions.logger.log('Document successfully written!')
      })
      .catch((error) => {
        functions.logger.error('Error writing document: ', error)
      })
  })
