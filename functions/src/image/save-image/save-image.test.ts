import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../../index'
import { Collections } from '../../model/collections'
import { Image } from '../../model/image'

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
    const requestData = { imageId: imageId, maskName: `mask_${imageId}_0.png` }
    const contextOptions = { auth: { uid: labellerId } }

    await saveImageFunction(requestData, contextOptions)

    // Then the labeller is added to the labellers array and a new mask is created
    const updatedImage = await db.collection(Collections.IMAGES).doc(imageId).get()

    expect(updatedImage.get('labellers')).toEqual([labellerId])
    expect(updatedImage.get('masks')).toEqual([{ name: `mask_${imageId}_0.png`, uploadedBy: labellerId }])
  })
})
