export interface Image {
  id?: string
  name?: string
  sampleLocation?: string
  sampleReference?: string
  masks?: Mask[]
  labellers?: string[]
  markedAsInvalid?: number
  isCompleted?: boolean
  createdOn?: Date
}

export interface Mask {
  name: string
  uploadedBy: string
}
