import * as functions from 'firebase-functions'
import { db } from '../index'
import { Collections } from '../model/collections'
import { Image, ImageStatus } from '../model/image'
import { mapDocumentToSample } from '../model/mapper/sample-mapper'
import Sample from '../model/sample'

export const onNewSampleCreated = functions
  .region('europe-west1')
  .firestore.document('samples/{sample}')
  .onCreate(async (snapshot) => createImageFromSample(snapshot))

const createImageFromSample = async (sampleSnapshot: FirebaseFirestore.DocumentSnapshot) => {
  const sample: Sample = mapDocumentToSample(sampleSnapshot)

  const imageToCreate: Image = {
    name: 'image_0.jpg',
    sampleLocation: sample.location,
    sampleReference: sampleSnapshot.ref.path,
    masks: [
      {
        name: 'mask_0.png',
        uploadedBy: sample.uploadedBy,
      },
    ],
    isCompleted: false,
    status: ImageStatus.PENDING,
    createdOn: new Date(),
  }

  return db
    .collection(Collections.IMAGES)
    .add(imageToCreate)
    .then((value) => {
      functions.logger.log(`Image created successfully (path: ${value.path})`)
    })
}
