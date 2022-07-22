import * as admin from 'firebase-admin'
import { onNewFacilityCreated as onNewFacilityCreatedFunction } from './facility/facility-created'
import { fetchImageToLabel as fetchImageToLabelFunction } from './image/fetch-image'
import { skipImage as skipImageFunction } from './image/skip-image'
import { onNewUserCreated as onNewUserCreatedFunction } from './user/user-created'

admin.initializeApp()

export const db = admin.firestore()

export const onNewUserCreated = onNewUserCreatedFunction

export const onNewFacilityCreated = onNewFacilityCreatedFunction

export const skipImage = skipImageFunction

export const fetchImageToLabel = fetchImageToLabelFunction
