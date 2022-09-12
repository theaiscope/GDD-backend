import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../../index'
import { Collections } from '../../model/collections'
import { Image } from '../../model/image'
import { test as config } from '../../config.json'

describe('Skip image action', () => {
  const db = admin.firestore()
  const skipImageFunction = test().wrap(functions.skipImage)

  beforeEach(async () => {
    await test().firestore.clearFirestoreData(config.testProjectId)
  })

  it('should mark the image as skipped by the labeller, when the skip action is invoked', async () => {
    // Given an image
    const imageId = 'image-1'
    const sampleImage: Image = {
      name: 'image-1.jpg',
      isCompleted: false,
    }
    const labellerId = 'labeller-1'

    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When the skip action is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: labellerId } }

    await skipImageFunction(requestData, contextOptions)

    // Then the labeller is added to labellers array
    const expectedLabellers = [labellerId]
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('labellers')).toEqual(expectedLabellers)
  })

  it('should return an error when trying to skip an already completed image', async () => {
    // Given a completed image
    const imageId = 'image-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      isCompleted: true,
    }
    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When skip action is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: 'labeller-1' } }

    // Then an error is returned
    const expectedError = {
      code: 'failed-precondition',
      message: 'Image is already completed',
    }

    await expect(async () => {
      await skipImageFunction(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })

  it('should return an error when trying to skip an image already labelled by the user', async () => {
    // Given an image labelled by the user
    const imageId = 'image-1'
    const userId = 'labeller-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      labellers: [userId],
      isCompleted: false,
    }
    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When skip action is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: userId } }

    // Then an error is returned
    const expectedError = {
      code: 'failed-precondition',
      message: 'Image is already labelled',
    }

    await expect(async () => {
      await skipImageFunction(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })

  it('should return an error when trying to skip an image that does not exist', async () => {
    // Given an non-existing image
    const imageId = 'image-1'

    // When skip action is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: 'labeller-1' } }

    // Then an error is returned
    const expectedError = {
      code: 'not-found',
      message: 'Image not found',
    }

    await expect(async () => {
      await skipImageFunction(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })
})
