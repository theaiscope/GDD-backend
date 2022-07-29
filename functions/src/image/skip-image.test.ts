import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../index'
import { Collections } from '../model/collections'
import { Image } from '../model/image'

describe('Skip image action', () => {
  const db = admin.firestore()

  beforeEach(async () => {
    await test().firestore.clearFirestoreData({ projectId: 'aiscope-labelling-app-test' })
  })

  it('should mark the image as skipped by the labeller, when the skip action is invoked', async () => {
    // Given an image
    const imageId = 'image111'
    const sampleImage: Image = {
      name: 'image_0.jpg',
      sampleLocation: '1',
      sampleReference: '1',
      masks: [],
      markedAsInvalid: 0,
      isCompleted: false,
      createdOn: new Date('June 13, 2022, 12:00:00'),
    }

    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When the skip action is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: 'labellerId01' } }

    const wrappedSubmitImage = test().wrap(functions.skipImage)
    await wrappedSubmitImage(requestData, contextOptions)

    // Then the labeller is added to labellers array
    const expectedLabellers = ['labellerId01']
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('labellers').length).toBeGreaterThan(0)
    expect(updatedImage.get('labellers')).toEqual(expectedLabellers)
  })

  it('should return an error when trying to skip an already completed image', async () => {
    // Given a completed image
    const imageId = 'image111'
    const sampleImage: Image = {
      name: 'image_0.jpg',
      sampleLocation: '1',
      sampleReference: '1',
      masks: [],
      labellers: [],
      markedAsInvalid: 0,
      isCompleted: true,
      createdOn: new Date('June 13, 2022, 12:00:00'),
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

    await expect(async () => {
      await wrappedSubmitImage(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })

  it('should return an error when trying to skip an already labelled image by the user', async () => {
    // Given an image labelled by the user
    const imageId = 'image111'
    const userId = 'labellerId01'
    const sampleImage: Image = {
      name: 'image_0.jpg',
      sampleLocation: '1',
      sampleReference: '1',
      masks: [],
      labellers: [userId],
      markedAsInvalid: 0,
      isCompleted: false,
      createdOn: new Date('June 13, 2022, 12:00:00'),
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

    await expect(async () => {
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
      message: 'Image not found',
    }

    await expect(async () => {
      await wrappedSubmitImage(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })
})
