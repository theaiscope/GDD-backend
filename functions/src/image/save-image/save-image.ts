import * as functions from 'firebase-functions'
import { db } from '../../index'
import { Collections } from '../../model/collections'
import { Image, Mask } from '../../model/image'
import { SaveImageRequest } from './model/save-image-request'

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

      const labellers: string[] = [...(image.labellers ?? []), labellerId]

      const mask: Mask = { name: maskName, uploadedBy: labellerId }
      const masks: Mask[] = [...(image.masks ?? []), mask]

      transaction.update(imageRef, {
        labellers,
        masks,
      })
    })

    return { message: 'Image saved', imageId: data.imageId, labellerId }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error

    throw new functions.https.HttpsError('internal', 'Unexpected error occurred while saving image')
  }
})
