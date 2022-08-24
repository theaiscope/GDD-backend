import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../index'
import { Collections } from '../model/collections'
import Sample from '../model/sample'
import { test as config } from '../config.json'

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
      location: 'location',
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
  })
})
