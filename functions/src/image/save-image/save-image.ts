import * as functions from 'firebase-functions'
import { db } from '../../index'
import { Collections } from '../../model/collections'
import { Image, ImageStatus, Mask } from '../../model/image'
import { SaveImageRequest } from './model/save-image-request'

const SAVED_MASKS_TO_COMPLETE = 4

export const saveImage = functions.region('europe-west1').https.onCall(async (data: SaveImageRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.')
  }

  const labellerId = context.auth.uid
  const { imageId, maskName } = data

  try {
    await db.runTransaction(async (transaction) => {
      const imageRef = db.collection(Collections.IMAGES).doc(imageId)
      const imageDoc = await transaction.get(imageRef)
      const image = imageDoc.data() as Image

      validateCanSaveImage(image, labellerId)

      const labellers: string[] = [...(image.labellers ?? []), labellerId]
      const mask: Mask = { name: maskName, uploadedBy: labellerId }
      const masks: Mask[] = [...(image.masks ?? []), mask]

      const reachedSavedLimit: boolean = masks.length === SAVED_MASKS_TO_COMPLETE
      const isCompleted: boolean = reachedSavedLimit
      const status: ImageStatus = reachedSavedLimit ? ImageStatus.CONFIRMED_VALID : ImageStatus.IN_REVIEW

      transaction.update(imageRef, {
        labellers,
        masks,
        status,
        isCompleted,
      })
    })

    return { message: 'Image saved', imageId: data.imageId, labellerId }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error

    throw new functions.https.HttpsError('internal', 'Unexpected error occurred while saving image')
  }
})

function validateCanSaveImage(image: Image | undefined, labellerId: string): void {
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
