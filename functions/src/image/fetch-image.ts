import * as functions from 'firebase-functions'
import { db } from '..'
import { Collections } from '../model/collections'
import { CREATED_ON, IS_COMPLETED } from './query-constants'

export const fetchImageToLabel = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.')
  }
  const labellerId = context.auth.uid

  const imagesSnaphot = await db
    .collection(Collections.IMAGES)
    .where(IS_COMPLETED, '==', false)
    .orderBy(CREATED_ON)
    .get()

  return imagesSnaphot.docs.find((image) => !image.get('labellers').includes(labellerId))
})
