import * as admin from 'firebase-admin'
import * as FacilityCreated from './facility/facility-created'
import * as UserCreated from './user/user-created'
import { skipImage as skipImageFunction } from './image/image-skip'

admin.initializeApp()

export const db = admin.firestore()

export const onNewUserCreated = UserCreated.onNewUserCreated

export const onNewFacilityCreated = FacilityCreated.onNewFacilityCreated

export const skipImage = skipImageFunction
