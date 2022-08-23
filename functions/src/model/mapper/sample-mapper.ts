import Sample from '../sample'

export function mapDocumentToSample(doc: FirebaseFirestore.DocumentSnapshot): Sample {
  return {
    id: doc.id,
    ...doc.data(),
  } as Sample
}
