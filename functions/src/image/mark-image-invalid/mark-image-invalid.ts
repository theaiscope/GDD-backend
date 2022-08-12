import * as functions from 'firebase-functions'
import { db } from '../../index'
import { Collections } from '../../model/collections'
import { Image, ImageStatus } from '../../model/image'

const MARK_AS_INVALID_LIMIT_TO_COMPLETE = 3

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

      const labellers: string[] = [...(image.labellers ?? []), labellerId]
      const markedAsInvalid: number = (image.markedAsInvalid ?? 0) + 1

      const reachedMarkAsInvalidLimit: boolean = markedAsInvalid === MARK_AS_INVALID_LIMIT_TO_COMPLETE
      const isCompleted: boolean = reachedMarkAsInvalidLimit
      const status: ImageStatus = reachedMarkAsInvalidLimit ? ImageStatus.CONFIRMED_INVALID : ImageStatus.IN_REVIEW

      transaction.update(imageRef, {
        labellers,
        markedAsInvalid,
        status,
        isCompleted,
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
