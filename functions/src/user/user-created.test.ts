import * as admin from 'firebase-admin'
import * as test from 'firebase-functions-test'
import { Collections } from '../model/collections'
import * as functions from '../index'
import UserRecord = admin.auth.UserRecord

describe('UserCreated', () => {
  const db = admin.firestore()
  const onUserCreatedFunction = test().wrap(functions.onNewUserCreated)

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

    await onUserCreatedFunction(user)

    const createdMicroscopist = await db.collection(Collections.MICROSCOPISTS).doc(user.uid).get()

    expect(createdMicroscopist.exists).toBeTruthy()
    expect(createdMicroscopist.get('enabled')).toBeFalsy()
  })
})
