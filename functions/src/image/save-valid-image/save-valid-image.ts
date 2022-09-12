import * as functions from 'firebase-functions'
import { db } from '../../index'
import { Collections } from '../../model/collections'
import { Image, ImageStatus, Mask } from '../../model/image'
import { SaveValidImageRequest } from './model/save-image-request'
import * as config from '../../config.json'

const SAVED_MASKS_TO_COMPLETE = 4

export const saveValidImage = functions
  .region(config.functionsRegion)
  .https.onCall(async (data: SaveValidImageRequest, context) => {
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

        validateCanSaveValidImage(image, labellerId)

        const labellers: string[] = [...(image.labellers ?? []), labellerId]
        const mask: Mask = {
          name: maskName,
          uploadedBy: `${Collections.MICROSCOPISTS}/${labellerId}`,
        }
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

function validateCanSaveValidImage(image: Image | undefined, labellerId: string): void {
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
