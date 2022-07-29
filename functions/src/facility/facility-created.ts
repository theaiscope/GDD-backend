import * as functions from 'firebase-functions'
import { Collections } from '../model/collections'
import { db } from '../index'

const DEFAULT_FACILITY_NAME = '___NAME HERE___'
const DEFAULT_FACILITY_MICROSCOPISTS: string[] = []

export const onNewFacilityCreated = functions
  .region('europe-west1')
  .firestore.document('facilities/{facility}')
  .onCreate(async (snapshot) => addInitialValues(snapshot))

const addInitialValues = async (snapshot: FirebaseFirestore.DocumentSnapshot) => {
  const currentMicroscopist = snapshot.get('microscopists')
  const currentName = snapshot.get('name')

  if (currentMicroscopist && currentName) return

  const valuesToInit = {
    microscopists: currentMicroscopist ?? DEFAULT_FACILITY_MICROSCOPISTS,
    name: currentName ?? DEFAULT_FACILITY_NAME,
  }

  return db
    .collection(Collections.FACILITIES)
    .doc(snapshot.id)
    .set(valuesToInit, { merge: true })
    .then(() => {
      functions.logger.log('Document successfully written!')
    })
    .catch((error) => {
      functions.logger.error('Error writing document: ', error)
    })
}
