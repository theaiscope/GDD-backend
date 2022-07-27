import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
// import * as firebaseFunctions from 'firebase-functions'
import { Collections } from '../data/collections'
import * as functions from '../index'

describe('Skip image action', () => {
  const db = admin.firestore()

  beforeEach(async () => {
    await test().firestore.clearFirestoreData({ projectId: 'aiscope-labelling-app-test' })
  })

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
    const expectedLabellers = ['labellerId01']

    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // when skip action is invoked
    const wrappedSubmitImage = test().wrap(functions.skipImage)
    await wrappedSubmitImage(requestData, contextOptions)

    // then labeller is added to labellers array
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('labellers').length).toBeGreaterThan(0)
    expect(updatedImage.get('labellers')).toEqual(expectedLabellers)
  })

  it('should return an error when trying to skip an already completed image', async () => {
    // Given a completed image
    const imageId = 'image111'
    const sampleImage = {
      markedAsInvalid: 0,
      masks: [],
      name: 'image_0.jpg',
      skipped: 0,
      labellers: [],
      createdOn: new Date('June 13, 2022, 12:00:00'),
      isCompleted: true,
      sampleLocation: '1',
      sampleReference: '1',
    }
    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When skip action is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: 'labellerId01' } }

    const wrappedSubmitImage = test().wrap(functions.skipImage)

    // Then an error is returned
    const expectedError = {
      code: 'failed-precondition',
      message: 'Image is already completed',
    }

    expect(async () => {
      await wrappedSubmitImage(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })

  it('should return an error when trying to skip an already labelled image by the user', async () => {
    // Given an image labelled by the user
    const imageId = 'image111'
    const userId = 'labellerId01'
    const sampleImage = {
      markedAsInvalid: 0,
      masks: [],
      name: 'image_0.jpg',
      skipped: 0,
      labellers: [userId],
      createdOn: new Date('June 13, 2022, 12:00:00'),
      isCompleted: false,
      sampleLocation: '1',
      sampleReference: '1',
    }
    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When skip action is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: userId } }

    const wrappedSubmitImage = test().wrap(functions.skipImage)

    // Then an error is returned
    const expectedError = {
      code: 'failed-precondition',
      message: 'Image is already labelled',
    }

    expect(async () => {
      await wrappedSubmitImage(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })

  it('should return an error when trying to skip an image that does not exist', async () => {
    // Given an non-existing image
    const imageId = 'image111'

    // When skip action is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: 'labellerId01' } }

    const wrappedSubmitImage = test().wrap(functions.skipImage)

    // Then an error is returned
    const expectedError = {
      code: 'not-found',
    }

    expect(async () => {
      await wrappedSubmitImage(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })
})
