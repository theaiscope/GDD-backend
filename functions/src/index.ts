import * as admin from 'firebase-admin'
import { onNewFacilityCreated as onNewFacilityCreatedFunction } from './facility/facility-created'
import { fetchImageToLabel as fetchImageToLabelFunction } from './image/fetch-image/fetch-image'
import { skipImage as skipImageFunction } from './image/skip-image/skip-image'
import { markImageInvalid as markImageInvalidFunction } from './image/mark-image-invalid/mark-image-invalid'
import { saveValidImage as saveValidImageFunction } from './image/save-valid-image/save-valid-image'
import { onNewUserCreated as onNewUserCreatedFunction } from './user/user-created'

admin.initializeApp()

export const db = admin.firestore()

export const onNewUserCreated = onNewUserCreatedFunction

export const onNewFacilityCreated = onNewFacilityCreatedFunction

export const skipImage = skipImageFunction

export const markImageInvalid = markImageInvalidFunction

export const saveValidImage = saveValidImageFunction

export const fetchImageToLabel = fetchImageToLabelFunction
