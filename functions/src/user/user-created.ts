import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { Collections } from '../model/collections'
import { db } from '../index'
import * as config from '../config.json'
import UserRecord = admin.auth.UserRecord

export const onNewUserCreated = functions
  .region(config.functionsRegion)
  .auth.user()
  .onCreate(async (user) => {
    return saveMicroscopistToFirestore(user).catch((error) => {
      functions.logger.error('Error writing document: ', error)
    })
  })

const saveMicroscopistToFirestore = (user: UserRecord) =>
  db
    .collection(Collections.MICROSCOPISTS)
    .doc(user.uid)
    .set({
      enabled: false,
    })
    .then(function () {
      functions.logger.log('Document successfully written!')
    })
