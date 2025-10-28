import { API_ROUTE_ALL_PARTICIPANTS, API_ROUTE_ALL_PRIZES } from "../settings"
import { Participant, Prize } from "../types/BackendTypes"


export const getAllPrizes: () => Promise<Prize[]> = async () => {

  return fetch(API_ROUTE_ALL_PRIZES,
    {
      method: 'GET'
    }
  )
  .then(response => response.json())
  .then(parsedObj => {
    console.log(parsedObj)
    return parsedObj.map(entry => {
      return {
        provider: entry.provider,
        displayName: entry.display_name,
        id: entry.id
      }
    })
  })

}


export const wipeAllPrizes: () => Promise<boolean> = async () => {

  return fetch(API_ROUTE_ALL_PRIZES,
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


type UploadNewPrizesCsvResponse = {
  parsedPrizes: number,
  error: string | null
}

export const uploadNewPrizesCsv: (csvFile: File) => Promise<UploadNewPrizesCsvResponse> = async (csvFile) => {
  const data = new FormData()
  data.append('csv', csvFile)

  return fetch(API_ROUTE_ALL_PRIZES,
    {
      method: 'PUT',
      body: data
    }
  )
    .then(response => {
      if (!response.ok) {
        return response.json()
          .then(parsedObj => {
            if (parsedObj.hasOwnProperty('parsed_prizes') && parsedObj.hasOwnProperty('error')) {
              throw new Error(parsedObj.error)
            } else {
              throw new Error(JSON.stringify(parsedObj))
            }
          })
      }
      return response.json()
    })
    .then(parsedObj => {
      if (!parsedObj.hasOwnProperty('parsed_prizes') || !parsedObj.hasOwnProperty('error')) {
        throw new Error(JSON.stringify(parsedObj))
      }
      return {
        parsedPrizes: parsedObj.parsed_prizes,
        error: parsedObj.error ? parsedObj.error : null
      }
    })
}