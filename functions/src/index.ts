import * as admin from 'firebase-admin'
import { onNewFacilityCreated as onNewFacilityCreatedFunction } from './facility/facility-created'
import { fetchImageToLabel as fetchImageToLabelFunction } from './image/fetch-image/fetch-image'
import { skipImage as skipImageFunction } from './image/skip-image/skip-image'
import { markImageInvalid as markImageInvalidFunction } from './image/mark-image-invalid/mark-image-invalid'
import { saveImage as saveImageFunction } from './image/save-image/save-image'
import { onNewUserCreated as onNewUserCreatedFunction } from './user/user-created'

admin.initializeApp()

export const db = admin.firestore()

export const onNewUserCreated = onNewUserCreatedFunction

export const onNewFacilityCreated = onNewFacilityCreatedFunction

export const skipImage = skipImageFunction

export const markImageInvalid = markImageInvalidFunction

export const saveImage = saveImageFunction

export const fetchImageToLabel = fetchImageToLabelFunction
