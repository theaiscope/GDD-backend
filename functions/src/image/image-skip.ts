import * as functions from 'firebase-functions'
import { Collections } from '../data/collections'
import { db } from '../index'

export const skipImage = functions.region('europe-west1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.')
  }

  const image = await db.collection(Collections.IMAGES).doc(data.imageId).get()
  const labellerId = context.auth.uid
  const labellers = [...image.get('labellers'), labellerId]

  return db
    .collection(Collections.IMAGES)
    .doc(data.imageId)
    .set({ labellers }, { merge: true })
    .then(() => {
      functions.logger.log('Image successfully updated!')
    })
    .catch((error) => {
      functions.logger.error('Error updating image: ', error)
    })
})