import { API_ROUTE_ALL_PARTICIPANTS, API_ROUTE_ALL_CANCELS, API_ROUTE_EDIT_CANCELS } from "../settings"
import { Participant } from "../types/BackendTypes"


export const getAllParticipants: () => Promise<Participant[]> = async () => {

  return fetch(API_ROUTE_ALL_PARTICIPANTS,
    {
      method: 'GET'
    }
  )
    .then(response => {
      if (!response.ok) {
        return response.text()
          .then(text => { throw new Error(text) })
      }
      return response.json()
    })
    .then(parsedObj => {
      console.log(parsedObj)
      return parsedObj.map(entry => {
        return {
          registrationId: entry.registration_id,
          username: entry.username,
          displayName: entry.display_name,
          connpassAttending: entry.connpass_attending
        }
      })
    })

}


export const wipeAllParticipants: () => Promise<boolean> = async () => {

  return fetch(API_ROUTE_ALL_PARTICIPANTS,
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


type UploadNewParticipantsCsvResponse = {
  parsedParticipants: number,
  error: string | null
}

export const uploadNewParticipantsCsv: (csvFile: File) => Promise<UploadNewParticipantsCsvResponse> = async (csvFile) => {
  const data = new FormData()
  data.append('csv', csvFile)

  return fetch(API_ROUTE_ALL_PARTICIPANTS,
    {
      method: 'PUT',
      body: data
    }
  )
    .then(response => {
      if (!response.ok) {
        return response.json()
          .then(parsedObj => {
            if (parsedObj.hasOwnProperty('parsed_participants') && parsedObj.hasOwnProperty('error')) {
              throw new Error(parsedObj.error)
            } else {
              throw new Error(JSON.stringify(parsedObj))
            }
          })
      }
      return response.json()
    })
    .then(parsedObj => {
      if (!parsedObj.hasOwnProperty('parsed_participants') || !parsedObj.hasOwnProperty('error')) {
        throw new Error(JSON.stringify(parsedObj))
      }
      return {
        parsedParticipants: parsedObj.parsed_participants,
        error: parsedObj.error ? parsedObj.error : null
      }
    })
}



// 当日不参加対応

export const getAllCancels: () => Promise<string[]> = async () => {

  return fetch(API_ROUTE_ALL_CANCELS,
    {
      method: 'GET'
    }
  )
    .then(response => {
      if (!response.ok) {
        return response.text()
          .then(text => { throw new Error(text) })
      }
      return response.json()
    })
}

export const wipeAllCancels: () => Promise<boolean> = async () => {

  return fetch(API_ROUTE_ALL_CANCELS,
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


export type CancelsListEditReturn = {
  success: string[]
  skipped: string[]
  nonexistentIds: string[]
}

export type ModifyCancelsParams = {
  action: 'ADD' | 'REMOVE',
  ids: string[]
}

export const modifyCancelsList: (params: ModifyCancelsParams) => Promise<CancelsListEditReturn> = async ({action, ids}) => {

  return fetch(API_ROUTE_EDIT_CANCELS,
    {
      method: action === "ADD" ? "PUT" : "DELETE",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ids)
    }
  )
    .then(response => {
      if (!response.ok) {
        return response.text()
          .then(text => { throw new Error(text) })
      }
      return response.json()
    })
    .then(parsedObj => {
      return {
        success: parsedObj.success,
        skipped: parsedObj.skipped,
        nonexistentIds: parsedObj.nonexistent_ids
      }
    })
}