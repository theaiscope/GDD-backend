import * as test from 'firebase-functions-test'
import Sample from '../sample'
import { mapDocumentToSample } from './sample-mapper'

describe('SampleMapper', () => {
  it('should map a document to a Sample including the id', () => {
    const id = 'test_id_123'
    const document = {
      location: 'location',
      numberOfImages: 0,
      uploadedBy: '/microscopists/1',
    }
    const documentSnapshot = test().firestore.makeDocumentSnapshot(document, `/samples/${id}`)

    const result = mapDocumentToSample(documentSnapshot)

    expect(result).toBeDefined()
    expect(result.id).toEqual(id)
    expect(result).toMatchObject<Sample>(document)
  })
})
