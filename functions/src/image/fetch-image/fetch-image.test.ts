import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import { Collections } from '../../model/collections'
import * as functions from '../../index'
import { Image } from '../../model/image'
import { test as config } from '../../config.json'

describe('FetchImage', () => {
  const db = admin.firestore()

  const testUserId = 'user-id-1'
  const contextOptions = { auth: { uid: testUserId } }
  const fetchImageFunction = test().wrap(functions.fetchImageToLabel)

  beforeEach(async () => {
    await test().firestore.clearFirestoreData(config.testProjectId)
  })

  it('should not return an image when there is no image', async () => {
    const result = await fetchImageFunction(null, contextOptions)

    expect(result).toBeUndefined()
  })

  it('should not return an image when all the images are completed', async () => {
    await createTestImage('image-id-1', { isCompleted: true })
    await createTestImage('image-id-2', { isCompleted: true })

    const result = await fetchImageFunction(null, contextOptions)

    expect(result).toBeUndefined()
  })

  it('should return the oldest created image as the next image to label', async () => {
    const idOldestImage = 'cqPCZrwCh'
    await createTestImage(idOldestImage, { createdOn: new Date('2022-08-01') })
    await createTestImage('bgoRDxigm', { createdOn: new Date('2022-08-05') })
    await createTestImage('mkXGjyvke', { createdOn: new Date('2022-08-10') })

    const result = await fetchImageFunction(null, contextOptions)

    expect(result).toBeDefined()
    expect(result.id).toEqual(idOldestImage)
  })

  it('should return the next not completed image', async () => {
    await createTestImage('image-id-1', { isCompleted: true })
    await createTestImage('image-id-2')

    const result = await fetchImageFunction(null, contextOptions)

    expect(result).toBeDefined()
    expect(result.id).toEqual('image-id-2')
  })

  it('should return the next image not yet labelled by the user', async () => {
    await createTestImage('image-id-1', { isCompleted: false, labellers: [testUserId] })
    await createTestImage('image-id-2', { isCompleted: true })
    await createTestImage('image-id-3', { isCompleted: false })

    const result = await fetchImageFunction(null, contextOptions)

    expect(result).toBeDefined()
    expect(result.id).toEqual('image-id-3')
  })

  it('should not return an image when the user has already labelled all the images', async () => {
    await createTestImage('image-id-1', { isCompleted: false, labellers: [testUserId] })
    await createTestImage('image-id-2', { isCompleted: false, labellers: [testUserId] })

    const result = await fetchImageFunction(null, contextOptions)

    expect(result).toBeUndefined()
  })

  const createTestImage = (id: string, initialData?: Image) =>
    db
      .collection(Collections.IMAGES)
      .doc(id)
      .set({
        name: 'image_name',
        isCompleted: false,
        markedAsInvalid: 0,
        labellers: [],
        sampleLocation: 'sample_location',
        sampleReference: '/samples/sample_reference',
        createdOn: new Date(),
        ...initialData,
      })
})
