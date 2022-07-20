import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import * as functions from '../index'
import UserRecord = admin.auth.UserRecord

describe('UserCreated', () => {
  const db = admin.firestore()

  it('should create a new disabled microscopist when a new user is created', async () => {
    const user: UserRecord = {
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

    const wrappedOnUserCreated = test().wrap(functions.onNewUserCreated)
    await wrappedOnUserCreated(user)

    const createdMicroscopist = await db.collection('microscopists').doc(user.uid).get()

    expect(createdMicroscopist.exists).toBeTruthy()
    expect(createdMicroscopist.get('enabled')).toBeFalsy()
  })
})
