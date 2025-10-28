

export type Participant = {
  registrationId: string
  username: string
  displayName: string
  connpassAttending: Boolean
}

export type Prize = {
    provider: string 
    displayName: string
    id: string
} 

export type Mapping = {
    participantId: string
    prizeId: string
}