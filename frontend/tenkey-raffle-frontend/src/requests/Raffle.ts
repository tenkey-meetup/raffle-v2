import { API_ROUTE_RAFFLE } from "../settings"

export type submitRaffleWinnerParams = {
  prizeId: string,
  winnerId: string
}

// 当選者を確定させる
export const submitRaffleWinner: (params: submitRaffleWinnerParams) => Promise<string | null> = async (params) => {

  const data = new FormData()
  data.append('prize_id', params.prizeId)
  data.append('winner_id', params.winnerId)

  return fetch(API_ROUTE_RAFFLE,
    {
      method: "POST",
      body: data
    }
  )
    .then(response => {
      if (!response.ok) {
        return response.text()
          .then(text => { throw new Error(text) })
      }
      return null
    })
}


