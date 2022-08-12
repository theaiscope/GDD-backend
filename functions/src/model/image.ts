export interface Image {
  id?: string
  name?: string
  sampleLocation?: string
  sampleReference?: string
  masks?: Mask[]
  labellers?: string[]
  markedAsInvalid?: number
  isCompleted?: boolean
  status?: ImageStatus
  createdOn?: Date
}

export interface Mask {
  name: string
  uploadedBy: string
}

export enum ImageStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  CONFIRMED_INVALID = 'CONFIRMED_INVALID',
  CONFIRMED_VALID = 'CONFIRMED_VALID',
}
