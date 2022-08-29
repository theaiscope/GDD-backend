import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../index'
import { Collections } from '../model/collections'
import Sample from '../model/sample'
import { test as config } from '../config.json'
import { mapDocumentToImage } from '../model/mapper/image-mapper'

describe('SampleCreated', () => {
  const db = admin.firestore()
  const onSampleCreatedFunction = test().wrap(functions.onNewSampleCreated)

  beforeEach(async () => {
    await test().firestore.clearFirestoreData(config.testProjectId)
  })

  it('should create an Image when a new Sample is created', async () => {
    // Given a new Sample is created
    const sampleRefPath = `samples/sample-1`
    const sample: Sample = {
      location: 'abc123-sample-location',
      numberOfImages: 1,
      uploadedBy: 'microscopists/microscopist-1',
      createdOn: new Date(),
    }

    // When the onSampleCreated function is executed
    const sampleSnapshot = test().firestore.makeDocumentSnapshot(sample, sampleRefPath)
    await onSampleCreatedFunction(sampleSnapshot)

    // Then an Image linked to the Sample should have been created
    const imagesSnapshot = await db.collection(Collections.IMAGES).where('sampleReference', '==', sampleRefPath).get()
    expect(imagesSnapshot.size).toBe(1)

    const createdImage = mapDocumentToImage(imagesSnapshot.docs[0])
    expect(createdImage.name).toBe('image_0.jpg')
    expect(createdImage.sampleLocation).toBe(sample.location)
    expect(createdImage.sampleReference).toBe(sampleRefPath)
    expect(createdImage.masks).toHaveLength(1)
    expect(createdImage.masks?.[0].name).toBe('mask_0.png')
    expect(createdImage.masks?.[0].uploadedBy).toBe(sample.uploadedBy)
    expect(createdImage.isCompleted).toBeFalsy()
  })

  it('should create an Image for each image in the Sample when it has more than one', async () => {
    // Given a new Sample is created indicating 3 images
    const sampleRefPath = `samples/sample-1`
    const sample: Sample = {
      location: 'location',
      numberOfImages: 3,
      uploadedBy: 'microscopists/microscopist-1',
      createdOn: new Date(),
    }

    // When the onSampleCreated function is executed
    const sampleSnapshot = test().firestore.makeDocumentSnapshot(sample, sampleRefPath)
    await onSampleCreatedFunction(sampleSnapshot)

    // Then 3 Images should have been created, linked to the Sample
    const imagesSnapshot = await db.collection(Collections.IMAGES).where('sampleReference', '==', sampleRefPath).get()
    const images = imagesSnapshot.docs.map((doc) => mapDocumentToImage(doc))

    expect(images.length).toBe(3)
    expect(images.find((image) => image.name === 'image_0.jpg')).toBeDefined()
    expect(images.find((image) => image.name === 'image_1.jpg')).toBeDefined()
    expect(images.find((image) => image.name === 'image_2.jpg')).toBeDefined()
  })
})
