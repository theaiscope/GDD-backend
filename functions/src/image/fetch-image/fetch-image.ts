import * as functions from 'firebase-functions'
import { db } from '../../index'
import { Collections } from '../../model/collections'
import { Image } from '../../model/image'
import { mapDocumentToImage } from '../../model/mapper/image-mapper'
import { CREATED_ON, IS_COMPLETED } from './query-constants'
import * as config from '../../config.json'

export const fetchImageToLabel = functions.region(config.functionsRegion).https.onCall(async (_, context) => {
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
