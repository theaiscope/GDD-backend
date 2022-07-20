import * as admin from 'firebase-admin'
import * as FacilityCreated from './facility/facility-created'
import * as UserCreated from './user/user-created'

admin.initializeApp()

export const db = admin.firestore()

export const onNewUserCreated = UserCreated.onNewUserCreated

export const onNewFacilityCreated = FacilityCreated.onNewFacilityCreated
