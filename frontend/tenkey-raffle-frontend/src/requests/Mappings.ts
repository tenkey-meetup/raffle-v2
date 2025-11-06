import { API_ROUTE_MAPPINGS, API_ROUTE_RAFFLE } from "../settings"
import { Mapping } from "../types/BackendTypes"

export const getAllMappings: () => Promise<Mapping[]> = async () => {

  return fetch(API_ROUTE_MAPPINGS,
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
          prizeId: entry.prize_id,
          winnerId: entry.winner_id
        }
      })
    })
}


export const wipeMappings: () => Promise<boolean> = async () => {

  return fetch(API_ROUTE_MAPPINGS,
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
  winnerId: string | null
}
export const editMappings: (params: SetMappingsParams) => Promise<boolean> = async ({action, prizeId, winnerId}) => {

    const data = new FormData()
    data.append('prize_id', prizeId)
    if (winnerId) {
      data.append('winner_id', winnerId)
    }

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
    

    return fetch(API_ROUTE_RAFFLE,
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
        return true
      })
}