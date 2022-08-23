import { Image } from '../image'

export function mapDocumentToImage(doc: FirebaseFirestore.DocumentSnapshot): Image {
  return {
    id: doc.id,
    ...doc.data(),
  } as Image
}
