import * as admin from 'firebase-admin'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

import * as test from 'firebase-functions-test'
import UserRecord = admin.auth.UserRecord
import * as functions from '../index'

describe('UserCreated', () => {
  const db = admin.firestore()

  it('should create a new microscopists when a new user is created', async () => {
    const wrappedFunction = test().wrap(functions.onNewUserCreated)

    await wrappedFunction(fakeUser)

    const createdMicroscopist = await db.collection('microscopists').doc(fakeUser.uid).get()

    expect(createdMicroscopist.exists).toBe(true)
    expect(createdMicroscopist.get('enabled')).toBe(false)
  })

  const fakeUser: UserRecord = {
    uid: '123',
    emailVerified: true,
    disabled: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
      toJSON: () => ({}),
    },
    providerData: [],
    toJSON: () => ({}),
  }
})
