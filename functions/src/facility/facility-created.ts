import * as functions from 'firebase-functions'
import { db } from '../index'

export const onNewFacilityCreated = functions
  .region('europe-west1')
  .firestore.document('facilities/{facility}')
  .onCreate(async (snapshot) => addInitialValues(snapshot))

const addInitialValues = async (snapshot: FirebaseFirestore.DocumentSnapshot) => {
  const currentMicroscopist = snapshot.get('microscopists')
  const currentName = snapshot.get('name')

  if (currentMicroscopist && currentName) return

  const valuesToInit = {
    microscopists: currentMicroscopist ?? [],
    name: currentName ?? '___NAME HERE___',
  }

  return db
    .collection('facilities')
    .doc(snapshot.id)
    .set(valuesToInit, { merge: true })
    .then(() => {
      functions.logger.log('Document successfully written!')
    })
    .catch((error) => {
      functions.logger.error('Error writing document: ', error)
    })
}
