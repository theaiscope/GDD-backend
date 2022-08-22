import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../../index'
import { Collections } from '../../model/collections'
import { Image, ImageStatus } from '../../model/image'
import { SaveImageRequest } from './model/save-image-request'

describe('SaveImage', () => {
  const db = admin.firestore()
  const saveImageFunction = test().wrap(functions.saveImage)

  beforeEach(async () => {
    await test().firestore.clearFirestoreData({ projectId: 'aiscope-labelling-app-test' })
  })

  it('should save the image by the labeller', async () => {
    // Given an image
    const imageId = 'image-1'
    const sampleImage: Image = {
      name: 'image_1.jpg',
      isCompleted: false,
    }
    const labellerId = 'labeller-1'

    await db.collection(Collections.IMAGES).doc(imageId).create(sampleImage)

    // When saveImage function is invoked
    const requestData: SaveImageRequest = {
      imageId: imageId,
      maskName: `mask_${imageId}_0.png`,
    }
    const contextOptions = { auth: { uid: labellerId } }

    await saveImageFunction(requestData, contextOptions)

    // Then the labeller is added to the labellers array and a new mask is created
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('labellers')).toEqual([labellerId])
    expect(updatedImage.get('masks')).toEqual([{ name: `mask_${imageId}_0.png`, uploadedBy: labellerId }])
  })

  it('should mark the image as CONFIRMED_VALID and flag isCompleted true when it is saved with 4 masks', async () => {
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

    // When saveImage function is invoked
    const requestData: SaveImageRequest = { imageId: imageId, maskName: `mask_${imageId}_3.png` }
    const contextOptions = { auth: { uid: 'labeller-1' } }

    await saveImageFunction(requestData, contextOptions)

    // Then the status should be CONFIRMED_VALID and isCompleted should be true
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('status')).toEqual(ImageStatus.CONFIRMED_VALID)
    expect(updatedImage.get('isCompleted')).toEqual(true)
  })
})
