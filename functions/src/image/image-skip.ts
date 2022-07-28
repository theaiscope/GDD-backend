import * as functions from 'firebase-functions'
import { db } from '../index'
import { Collections } from '../model/collections'
import { Image } from '../model/image'

export const skipImage = functions.region('europe-west1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.')
  }

  const imageSnapshot = await db.collection(Collections.IMAGES).doc(data.imageId).get()
  const image = imageSnapshot.data() as Image
  const labellerId = context.auth.uid

  validateImageCanBeSkipped(image, labellerId)

  const labellers = [...(image.labellers ?? []), labellerId]

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

function validateImageCanBeSkipped(image: Image | undefined, labellerId: string): void {
  if (!image) {
    throw new functions.https.HttpsError('not-found', 'Image does not exist.')
  }

  if (image.isCompleted) {
    throw new functions.https.HttpsError('failed-precondition', 'Image is already completed')
  }

  if (image.labellers?.includes(labellerId)) {
    throw new functions.https.HttpsError('failed-precondition', 'Image is already labelled')
  }
}
