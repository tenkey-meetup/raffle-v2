import { API_ROUTE_ALL_MAPPINGS, API_ROUTE_EDIT_MAPPINGS } from "../settings"
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


export type SetMappingsParams = {
  action: "SET" | "OVERWRITE" | "DELETE"
  prizeId: string
  winnerId: string
}
export const editMappings: (params: SetMappingsParams) => Promise<boolean> = async ({action, prizeId, winnerId}) => {

    const data = new FormData()
    data.append('prize_id', prizeId)
    data.append('winner_id', winnerId)

    let method: string;
    switch(action) {
      case "SET":
        method = "POST"
        break;
      case "OVERWRITE":
        method = "PUT"
        break;
      case "DELETE":
        method = "DELETE"
        break;
      default:
        throw new Error(`Unsupported edit mapping action "${action}"`)
    }
    

    return fetch(API_ROUTE_EDIT_MAPPINGS,
      {
        method: method,
        body: data 
      }
    )
      .then(response => {
        if (!response.ok) {
          return response.text()
            .then(text => { throw new Error(text) })
        }
        return response.json()
      })
      .then(() => {
        return true
      })
}