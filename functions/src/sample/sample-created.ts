import * as functions from 'firebase-functions'
import { db } from '../index'
import { Collections } from '../model/collections'
import { Image, ImageStatus } from '../model/image'
import { mapDocumentToSample } from '../model/mapper/sample-mapper'
import Sample from '../model/sample'
import * as config from '../config.json'
import DocumentReference = FirebaseFirestore.DocumentReference
import DocumentSnapshot = FirebaseFirestore.DocumentSnapshot

export const onNewSampleCreated = functions
  .region(config.functionsRegion)
  .firestore.document('samples/{sample}')
  .onCreate(async (snapshot) => createImageFromSample(snapshot))

const createImageFromSample = async (sampleSnapshot: DocumentSnapshot): Promise<DocumentReference[]> => {
  const sample: Sample = mapDocumentToSample(sampleSnapshot)

  const createPromises: Promise<DocumentReference>[] = []
  for (let imageIndex = 0; imageIndex < sample.numberOfImages; imageIndex++) {
    createPromises.push(createImage(imageIndex, sample, sampleSnapshot.ref))
  }

  return Promise.all(createPromises)
}

const createImage = async (
  imageIndex: number,
  sample: Sample,
  sampleReference: DocumentReference,
): Promise<DocumentReference> => {
  const imageName = `image_${imageIndex}.jpg`

  const imageToCreate: Image = {
    name: imageName,
    sampleLocation: sample.location,
    sampleReference: sampleReference.path,
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
      functions.logger.log(`Image (${value.path}) created from Sample (${sample.id})`)
      return value
    })
}
