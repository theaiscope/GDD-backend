import { makeDocumentSnapshot } from 'firebase-functions-test/lib/providers/firestore'
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
      skipped: 0,
      isCompleted: false,
    }
    const documentSnapshot = makeDocumentSnapshot(document, `/images/${id}`)

    const result = mapDocumentToImage(documentSnapshot)

    expect(result).toBeDefined()
    expect(result.id).toEqual(id)
    expect(result.name).toEqual(document.name)
    expect(result.sampleLocation).toEqual(document.sampleLocation)
    expect(result.sampleReference).toEqual(document.sampleReference)
    expect(result.masks).toEqual(document.masks)
    expect(result.labellers).toEqual(document.labellers)
    expect(result.markedAsInvalid).toEqual(document.markedAsInvalid)
    expect(result.skipped).toEqual(document.skipped)
    expect(result.isCompleted).toEqual(document.isCompleted)
  })
})
