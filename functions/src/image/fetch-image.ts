import * as functions from 'firebase-functions'
import { db } from '..'
import { Collections } from '../model/collections'
import { Image } from '../model/image'
import { mapDocumentToImage } from '../model/mapper/image-mapper'
import { CREATED_ON, IS_COMPLETED } from './query-constants'

export const fetchImageToLabel = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.')
  }

  const userId = context.auth.uid
  const notCompletedImages = await getNotCompletedImages()

  return notCompletedImages.find((image) => !image.labellers?.includes(userId))
})

async function getNotCompletedImages(): Promise<Image[]> {
  const imagesSnapshot = await db
    .collection(Collections.IMAGES)
    .where(IS_COMPLETED, '==', false)
    .orderBy(CREATED_ON)
    .get()

  return imagesSnapshot.docs.map(mapDocumentToImage)
}
