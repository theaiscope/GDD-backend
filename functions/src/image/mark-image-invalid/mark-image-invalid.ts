import * as functions from 'firebase-functions'
import { db } from '../../index'
import { Collections } from '../../model/collections'
import { Image } from '../../model/image'

export const markImageInvalid = functions.region('europe-west1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.')
  }
  const labellerId = context.auth.uid

  try {
    await db.runTransaction(async (transaction) => {
      const imageRef = db.collection(Collections.IMAGES).doc(data.imageId)
      const imageDoc = await transaction.get(imageRef)

      const image = imageDoc.data() as Image

      validateCanMarkImageInvalid(image, labellerId)

      const newLabellers = [...(image.labellers ?? []), labellerId]
      const newMarkedAsInvalid = (image.markedAsInvalid ?? 0) + 1

      transaction.update(imageRef, {
        labellers: newLabellers,
        markedAsInvalid: newMarkedAsInvalid,
      })
    })

    return { message: 'Image marked as invalid', imageId: data.imageId, labellerId }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error

    throw new functions.https.HttpsError('internal', 'Unexpected error occurred while marking image as invalid')
  }
})

function validateCanMarkImageInvalid(image: Image | undefined, labellerId: string): void {
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
