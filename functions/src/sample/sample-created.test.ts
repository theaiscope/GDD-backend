import * as test from 'firebase-functions-test'
import * as functions from '../index'

describe('SampleCreated', () => {
  const onSampleCreatedFunction = test().wrap(functions.onNewSampleCreated)

  it('should execute when a new sample is created', async () => {
    const sampleId = 'sample-1'
    const sample = {
      location: 'location',
    }
    const sampleSnapshot = test().firestore.makeDocumentSnapshot(sample, `samples/${sampleId}`)

    const result = await onSampleCreatedFunction(sampleSnapshot)
    expect(result).toBe(`created: ${sampleId}`)
  })
})
