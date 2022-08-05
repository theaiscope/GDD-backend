import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../index'
import { Collections } from '../model/collections'

describe('FacilityCreated', () => {
  const db = admin.firestore()
  const onFacilityCreatedFunction = test().wrap(functions.onNewFacilityCreated)

  beforeEach(async () => {
    await test().firestore.clearFirestoreData({ projectId: 'aiscope-labelling-app-test' })
  })

  it('should initialize microscopists when creating a new facility without microscopists', async () => {
    // Given a new facility is created without microscopists
    const facilityId = 'facility111'
    const emptyFacility = {}
    await db.collection(Collections.FACILITIES).doc(facilityId).create(emptyFacility)

    // When the onFacilityCreated function is executed
    const facilitySnapshot = test().firestore.makeDocumentSnapshot(emptyFacility, `facilities/${facilityId}`)

    await onFacilityCreatedFunction(facilitySnapshot)

    // Then the microscopists should have been initialized
    const createdFacility = await db.collection(Collections.FACILITIES).doc(facilityId).get()

    expect(createdFacility.exists).toBeTruthy()
    expect(createdFacility.get('microscopists')).toBeDefined()
    expect(createdFacility.get('microscopists').length).toEqual(0)
  })

  it('should initialize the name when creating a new facility without name', async () => {
    // Given a new facility is created without a name
    const facilityId = 'facility111'
    const emptyFacility = {}
    await db.collection(Collections.FACILITIES).doc(facilityId).create(emptyFacility)

    // When the onFacilityCreated function is executed
    const facilitySnapshot = test().firestore.makeDocumentSnapshot(emptyFacility, `facilities/${facilityId}`)

    await onFacilityCreatedFunction(facilitySnapshot)

    // Then the name should have been initialized
    const createdFacility = await db.collection(Collections.FACILITIES).doc(facilityId).get()

    expect(createdFacility.exists).toBeTruthy()
    expect(createdFacility.get('name')).toEqual('___NAME HERE___')
  })

  it('should not change microscopists when creating a new facility with microscopists filled', async () => {
    // Given a new facility is created with microscopists defined
    const facilityId = 'facility111'
    const facilityToCreate = {
      microscopists: ['microscopists/abc123'],
    }
    await db.collection(Collections.FACILITIES).doc(facilityId).create(facilityToCreate)

    // When the onFacilityCreated function is executed
    const facilitySnapshot = test().firestore.makeDocumentSnapshot(facilityToCreate, `facilities/${facilityId}`)

    await onFacilityCreatedFunction(facilitySnapshot)

    // Then the microscopists should not have been changed
    const createdFacility = await db.collection(Collections.FACILITIES).doc(facilityId).get()

    expect(createdFacility.exists).toBeTruthy()
    expect(createdFacility.get('microscopists')).toEqual(facilityToCreate.microscopists)
  })

  it('should not change name when creating a new facility with name filled', async () => {
    // Given a new facility is created with a name
    const facilityId = 'facility111'
    const facilityToCreate = {
      name: 'Test Facility',
    }
    await db.collection(Collections.FACILITIES).doc(facilityId).create(facilityToCreate)

    // When the onFacilityCreated function is executed
    const snapshot = test().firestore.makeDocumentSnapshot(facilityToCreate, `facilities/${facilityId}`)

    await onFacilityCreatedFunction(snapshot)

    // Then the name should not have been changed
    const createdFacility = await db.collection(Collections.FACILITIES).doc(facilityId).get()

    expect(createdFacility.exists).toBeTruthy()
    expect(createdFacility.get('name')).toEqual(facilityToCreate.name)
  })
})
