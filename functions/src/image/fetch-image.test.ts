import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import { Collections } from '../data/collections'
import * as functions from '../index'

describe('FetchImage', () => {
  const db = admin.firestore()

  it('should return the next not completed image to label', async () => {
    const imageId = 'image-1'
    await createTestImage(imageId)

    const wrappedFetchImage = test().wrap(functions.fetchImageToLabel)
    const result = await wrappedFetchImage(null, { auth: { uid: 'user-1' } })

    expect(result).toBeDefined()
    expect(result.id).toEqual(imageId)
  })

  const createTestImage = (id: string) =>
    db.collection(Collections.IMAGES).doc(id).set({
      name: `image_name`,
      isCompleted: false,
      markedAsInvalid: 0,
      labellers: [],
      sampleLocation: 'sample_location',
      sampleReference: '/samples/sample_reference',
      createdOn: new Date(),
    })
})
