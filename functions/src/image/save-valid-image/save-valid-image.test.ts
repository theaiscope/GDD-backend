import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../../index'
import { Collections } from '../../model/collections'
import { Image, ImageStatus, Mask } from '../../model/image'
import { SaveValidImageRequest } from './model/save-image-request'

describe('SaveValidImage', () => {
  const db = admin.firestore()
  const saveValidImageFunction = test().wrap(functions.saveValidImage)

  beforeEach(async () => {
    await test().firestore.clearFirestoreData({ projectId: 'aiscope-labelling-app-test' })
  })

  it('should set the image as saved by the labeller and add new mask', async () => {
    // Given an image
    const imageId = 'image-1'
    const maskName = `mask_${imageId}_0.png`
    const labellerId = 'labeller-1'

    const sampleImage: Image = {
      name: 'image_1.jpg',
      isCompleted: false,
    }

    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When saveValidImage function is invoked
    const requestData: SaveValidImageRequest = {
      imageId,
      maskName,
    }
    const contextOptions = { auth: { uid: labellerId } }

    await saveValidImageFunction(requestData, contextOptions)

    // Then the labeller and a new mask are added
    const expectedLabellers: string[] = [labellerId]
    const expectedMasks: Mask[] = [
      {
        name: maskName,
        uploadedBy: `${Collections.MICROSCOPISTS}/${labellerId}`,
      },
    ]

    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('labellers')).toEqual(expectedLabellers)
    expect(updatedImage.get('masks')).toEqual(expectedMasks)
  })

  it('should mark the image as CONFIRMED_VALID and Completed when it is saved with 4 masks', async () => {
    // Given an image with 3 masks
    const imageId = 'image-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      isCompleted: false,
      labellers: ['previous-labeller-1', 'previous-labeller-2', 'previous-labeller-3'],
      masks: [
        { name: 'mask_image-1_0.png', uploadedBy: 'previous-labeller-1' },
        { name: 'mask_image-1_1.png', uploadedBy: 'previous-labeller-2' },
        { name: 'mask_image-1_2.png', uploadedBy: 'previous-labeller-3' },
      ],
    }
    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When saveValidImage function is invoked
    const requestData: SaveValidImageRequest = { imageId: imageId, maskName: `mask_${imageId}_3.png` }
    const contextOptions = { auth: { uid: 'labeller-1' } }

    await saveValidImageFunction(requestData, contextOptions)

    // Then the status should be CONFIRMED_VALID and isCompleted should be true
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('status')).toEqual(ImageStatus.CONFIRMED_VALID)
    expect(updatedImage.get('isCompleted')).toEqual(true)
    expect(updatedImage.get('masks').length).toBe(4)
  })

  it('should return an error when trying to save an already completed image', async () => {
    // Given a completed image
    const imageId = 'image-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      isCompleted: true,
    }
    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When saveValidImage function is invoked
    const requestData: SaveValidImageRequest = { imageId: imageId, maskName: `mask_${imageId}_0.png` }
    const contextOptions = { auth: { uid: 'labeller-1' } }

    // Then an error is returned
    const expectedError = {
      code: 'failed-precondition',
      message: 'Image is already completed',
    }

    await expect(async () => {
      await saveValidImageFunction(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })

  it('should return an error when trying to save an image already labelled by the user', async () => {
    // Given an image labelled by the user
    const imageId = 'image-1'
    const userId = 'labeller-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      labellers: [userId],
      masks: [
        {
          name: 'mask_image-1_0.png',
          uploadedBy: userId,
        },
      ],
      isCompleted: false,
    }
    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When saveValidImage function is invoked
    const requestData: SaveValidImageRequest = { imageId: imageId, maskName: `mask_${imageId}_1.png` }
    const contextOptions = { auth: { uid: userId } }

    // Then an error is returned
    const expectedError = {
      code: 'failed-precondition',
      message: 'Image is already labelled',
    }

    await expect(async () => {
      await saveValidImageFunction(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })

  it('should return an error when trying to save an image that does not exist', async () => {
    // Given an non-existing image
    const imageId = 'image-1'

    // When saveValidImage function is invoked
    const requestData: SaveValidImageRequest = { imageId: imageId, maskName: `mask_${imageId}_0.png` }
    const contextOptions = { auth: { uid: 'labeller-1' } }

    // Then an error is returned
    const expectedError = {
      code: 'not-found',
      message: 'Image not found',
    }

    await expect(async () => {
      await saveValidImageFunction(requestData, contextOptions)
    }).rejects.toMatchObject(expectedError)
  })
})
