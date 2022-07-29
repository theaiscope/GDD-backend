import * as admin from 'firebase-admin'
import { onNewFacilityCreated as onNewFacilityCreatedFunction } from './facility/facility-created'
import { onNewUserCreated as onNewUserCreatedFunction } from './user/user-created'
import { skipImage as skipImageFunction } from './image/skip-image'

admin.initializeApp()

export const db = admin.firestore()

export const onNewUserCreated = onNewUserCreatedFunction

export const onNewFacilityCreated = onNewFacilityCreatedFunction

export const skipImage = skipImageFunction
