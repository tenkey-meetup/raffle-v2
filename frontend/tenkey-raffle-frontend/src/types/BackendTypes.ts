

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
  prizeId: string
  winnerId: string | null
}

export type NextRaffleDetails = {
  currentMappings: Mapping[],
  participantPoolIds: string[],
  nextPrize: Prize | null,
  prizeGroupIds: string[] | null
}