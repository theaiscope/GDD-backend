import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as FacilityCreated from './facility/facility-created'
import UserRecord = admin.auth.UserRecord

admin.initializeApp()
const db = admin.firestore()

export const onNewUserCreated = functions
  .region('europe-west1')
  .auth.user()
  .onCreate((user) => {
    try {
      console.log('>>>>>>> New user created:', user.uid)
      return saveMicroscopistToFirestore(user)
    } catch (error) {
      functions.logger.error('Error writing document: ', error)
      return null
    }
  })

const saveMicroscopistToFirestore = (user: UserRecord) =>
  db
    .collection('microscopists')
    .doc(user.uid)
    .set({
      enabled: false,
    })
    .then(function () {
      console.log('>>>> saveMicroscopistToFirestore called')
      functions.logger.log('Document successfully written!')
    })

export const onNewFacilityCreated = FacilityCreated.onNewFacilityCreated
