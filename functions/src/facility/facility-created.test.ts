import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../index'

describe('FacilityCreated', () => {
  const db = admin.firestore()

  it('should initialize microscopists when creating a new facility without microscopists', async () => {
    // Create a new facility without microscopists
    const facilityId = 'id111'
    const emptyFacility = {}
    await db.collection('facilities').doc(facilityId).create(emptyFacility)

    // Call the function
    const facilitySnapshot = test().firestore.makeDocumentSnapshot(emptyFacility, `facilities/${facilityId}`)

    const wrappedOnFacilityCreated = test().wrap(functions.onNewFacilityCreated)
    await wrappedOnFacilityCreated(facilitySnapshot)

    // Check that the microscopists were initialized
    const createdFacility = await db.collection('facilities').doc(facilityId).get()

    expect(createdFacility.exists).toBeTruthy()
    expect(createdFacility.get('microscopists')).toBeDefined()
    expect(createdFacility.get('microscopists').length).toEqual(0)
  })

  it('should initialize the name when creating a new facility without name', async () => {
    // Create a new facility without a name
    const facilityId = 'id222'
    const emptyFacility = {}
    await db.collection('facilities').doc(facilityId).create(emptyFacility)

    // Call the function
    const facilitySnapshot = test().firestore.makeDocumentSnapshot(emptyFacility, `facilities/${facilityId}`)

    const wrappedOnFacilityCreated = test().wrap(functions.onNewFacilityCreated)
    await wrappedOnFacilityCreated(facilitySnapshot)

    // Check that the name was initialized
    const createdFacility = await db.collection('facilities').doc(facilityId).get()

    expect(createdFacility.exists).toBeTruthy()
    expect(createdFacility.get('name')).toEqual('___NAME HERE___')
  })

  it('should not change microscopists when creating a new facility with microscopists filled', async () => {
    // Create a new facility
    const facilityId = 'id333'
    const facilityToCreate = {
      microscopists: ['microscopists/abc123'],
    }
    await db.collection('facilities').doc(facilityId).create(facilityToCreate)

    // Call the function
    const facilitySnapshot = test().firestore.makeDocumentSnapshot(facilityToCreate, `facilities/${facilityId}`)

    const wrappedOnFacilityCreated = test().wrap(functions.onNewFacilityCreated)
    await wrappedOnFacilityCreated(facilitySnapshot)

    // Check that the atributes were not changed
    const createdFacility = await db.collection('facilities').doc(facilityId).get()

    expect(createdFacility.exists).toBeTruthy()
    expect(createdFacility.get('microscopists')).toEqual(facilityToCreate.microscopists)
  })

  it('should not change name when creating a new facility with name filled', async () => {
    // Create a new facility
    const facilityId = 'id444'
    const facilityToCreate = {
      name: 'Test Facility',
    }
    await db.collection('facilities').doc(facilityId).create(facilityToCreate)

    // Call the function
    const snapshot = test().firestore.makeDocumentSnapshot(facilityToCreate, `facilities/${facilityId}`)

    const wrappedOnFacilityCreated = test().wrap(functions.onNewFacilityCreated)
    await wrappedOnFacilityCreated(snapshot)

    // Check that the atributes were not changed
    const createdFacility = await db.collection('facilities').doc(facilityId).get()

    expect(createdFacility.exists).toBeTruthy()
    expect(createdFacility.get('name')).toEqual(facilityToCreate.name)
  })
})
