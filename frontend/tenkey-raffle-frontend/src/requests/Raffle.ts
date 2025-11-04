import { API_ROUTE_RAFFLE_NEXT } from "../settings"
import { NextRaffleDetails } from "../types/BackendTypes"

export const getNextRaffleDetails: () => Promise<NextRaffleDetails> = async () => {

  return fetch(API_ROUTE_RAFFLE_NEXT,
    {
      method: 'GET'
    }
  )
    .then(response => response.json())
    .then(parsedObj => {
      console.log(parsedObj)
      return {
          currentMappings: parsedObj.current_mappings,
          participantPoolIds: parsedObj.participant_pool_ids,
          nextPrize: parsedObj.next_prize,
          prizeGroupIds: parsedObj.prize_group_ids
      }
    })

}