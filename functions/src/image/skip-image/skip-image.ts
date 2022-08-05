import * as functions from 'firebase-functions'
import { db } from '../../index'
import { Collections } from '../../model/collections'
import { Image } from '../../model/image'

export const skipImage = functions.region('europe-west1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.')
  }
  const labellerId = context.auth.uid

  try {
    await db.runTransaction(async (transaction) => {
      const imageRef = db.collection(Collections.IMAGES).doc(data.imageId)
      const imageDoc = await transaction.get(imageRef)

      const image = imageDoc.data() as Image

      validateImageCanBeSkipped(image, labellerId)

      const newLabellers = [...(image.labellers ?? []), labellerId]
      transaction.update(imageRef, { labellers: newLabellers })
    })

    return { message: 'Image skipped', imageId: data.imageId, labellerId }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error

    throw new functions.https.HttpsError('internal', 'Unexpected error occurred while skipping image')
  }
})

function validateImageCanBeSkipped(image: Image | undefined, labellerId: string): void {
  if (!image) {
    throw new functions.https.HttpsError('not-found', 'Image not found')
  }

  if (image.isCompleted) {
    throw new functions.https.HttpsError('failed-precondition', 'Image is already completed')
  }

  if (image.labellers?.includes(labellerId)) {
    throw new functions.https.HttpsError('failed-precondition', 'Image is already labelled')
  }
}
