import { API_ROUTE_ALL_MAPPINGS } from "../settings"
import { Mapping } from "../types/BackendTypes"

export const getAllMappings: () => Promise<Mapping[]> = async () => {

  return fetch(API_ROUTE_ALL_MAPPINGS,
    {
      method: 'GET'
    }
  )
    .then(response => {
      if (!response.ok) {
        return response.text()
          .then(text => { throw new Error(text)} )
      }
      return response.json()
    })
    .then(parsedObj => {
      console.log(parsedObj)
      return parsedObj.map(entry => {
        return {
          participantId: entry.participant_id,
          prizeId: entry.prize_id
        }
      })
    })
}


export const wipeMappings: () => Promise<boolean> = async () => {

  return fetch(API_ROUTE_ALL_MAPPINGS,
    {
      method: 'DELETE'
    }
  )
    .then(response => {
      if (!response.ok) {
        return response.text()
          .then(text => { throw new Error(text) })
      }
      return true
    })
}