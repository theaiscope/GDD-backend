import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as UserCreated from './user/user-created'
import * as FacilityCreated from './facility/facility-created'

admin.initializeApp(functions.config().firebase)

export const onNewUserCreated = UserCreated.onNewUserCreated

export const onNewFacilityCreated = FacilityCreated.onNewFacilityCreated
