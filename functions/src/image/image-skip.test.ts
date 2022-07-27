import * as admin from 'firebase-admin'
import { Collections } from '../data/collections'
import * as test from 'firebase-functions-test'
import * as functions from '../index'

describe('Skip image action', () => {
  const db = admin.firestore()

  it('should mark the image as skipped by the labeller, when the skip action is invoked', async () => {
    // Given an image
    const imageId = 'image111'
    const sampleImage = {
      markedAsInvalid: 0,
      masks: [],
      name: 'image_0.jpg',
      skipped: 0,
      labellers: [],
      createdOn: new Date('June 13, 2022, 12:00:00'),
      isCompleted: false,
      sampleLocation: '1',
      sampleReference: '1',
    }
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: 'labellerId01' } }
    const expectedLabellersArr = ['labellerId01']

    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // when skip action is invoked
    const wrappedSubmitImage = test().wrap(functions.skipImage)
    await wrappedSubmitImage(requestData, contextOptions)

    // then labeller is added to labellers array
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('labellers').length).toBeGreaterThan(0)
    expect(updatedImage.get('labellers')).toEqual(expectedLabellersArr)
  })
})
