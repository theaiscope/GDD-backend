import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import UserRecord = admin.auth.UserRecord

const db = admin.firestore()

export const onNewUserCreated = functions
  .region('europe-west1')
  .auth.user()
  .onCreate(async (user) => {
    return saveMicroscopistToFirestore(user).catch((error) => {
      functions.logger.error('Error writing document: ', error)
    })
  })

const saveMicroscopistToFirestore = (user: UserRecord) =>
  db
    .collection('microscopists')
    .doc(user.uid)
    .set({
      enabled: false,
    })
    .then(function () {
      functions.logger.log('Document successfully written!')
    })
