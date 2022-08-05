import * as test from 'firebase-functions-test'
import { Image } from '../image'
import { mapDocumentToImage } from './image-mapper'

describe('ImageMapper', () => {
  it('should map a document to an image including the id', () => {
    const id = 'test_id_123'
    const document = {
      name: 'image_name',
      sampleLocation: 'sample_location',
      sampleReference: '/samples/sample_reference',
      masks: [],
      labellers: ['user_id_1'],
      markedAsInvalid: 0,
      isCompleted: false,
    }
    const documentSnapshot = test().firestore.makeDocumentSnapshot(document, `/images/${id}`)

    const result = mapDocumentToImage(documentSnapshot)

    expect(result).toBeDefined()
    expect(result.id).toEqual(id)
    expect(result).toMatchObject<Image>(document)
  })
})
