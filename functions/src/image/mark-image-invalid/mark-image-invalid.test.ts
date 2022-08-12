import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../../index'
import { Collections } from '../../model/collections'
import { Image, ImageStatus } from '../../model/image'

describe('MarkImageAsInvalid', () => {
  const db = admin.firestore()
  const markImageInvalidFunction = test().wrap(functions.markImageInvalid)

  beforeEach(async () => {
    await test().firestore.clearFirestoreData({ projectId: 'aiscope-labelling-app-test' })
  })

  it('should mark the image as invalid by the labeller', async () => {
    // Given an image
    const imageId = 'image-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      isCompleted: false,
    }
    const labellerId = 'labeller-1'

    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When markImageInvalid function is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: labellerId } }

    await markImageInvalidFunction(requestData, contextOptions)

    // Then the labeller is added to the labellers array and markedAsInvalid is incremented
    const expectedLabellers = [labellerId]
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('labellers')).toEqual(expectedLabellers)
    expect(updatedImage.get('markedAsInvalid')).toEqual(1)
  })

  it('should mark the image as CONFIRMED_INVALID and flag isCompleted true when it is marked as invalid 3 times', async () => {
    // Given an image markedAsInvalid 2 times
    const imageId = 'image-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      markedAsInvalid: 2,
      isCompleted: false,
    }
    const labellerId = 'labeller-1'

    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When markImageInvalid function is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: labellerId } }

    await markImageInvalidFunction(requestData, contextOptions)

    // Then isCompleted should be set to true
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('status')).toEqual(ImageStatus.CONFIRMED_INVALID)
    expect(updatedImage.get('isCompleted')).toEqual(true)
  })

  it('should return an error when trying to mark as invalid an already completed image', async () => {
    // Given a completed image
    const imageId = 'image-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      isCompleted: true,
    }
    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When markImageInvalid function is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: 'labeller-1' } }

    // Then an error is returned
    const expectedError = {
      code: 'failed-precondition',
      message: 'Image is already completed',
    }

    await expect(async () => {
      await markImageInvalidFunction(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })

  it('should return an error when trying to mark as invalid an image already labelled by the user', async () => {
    // Given an image labelled by the user
    const imageId = 'image-1'
    const userId = 'labeller-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      labellers: [userId],
      isCompleted: false,
    }
    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When markImageInvalid function is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: userId } }

    // Then an error is returned
    const expectedError = {
      code: 'failed-precondition',
      message: 'Image is already labelled',
    }

    await expect(async () => {
      await markImageInvalidFunction(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })

  it('should return an error when trying to mark as invalid an image that does not exist', async () => {
    // Given an non-existing image
    const imageId = 'image-1'

    // When markImageInvalid function is invoked
    const requestData = { imageId: imageId }
    const contextOptions = { auth: { uid: 'labeller-1' } }

    // Then an error is returned
    const expectedError = {
      code: 'not-found',
      message: 'Image not found',
    }

    await expect(async () => {
      await markImageInvalidFunction(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })
})
