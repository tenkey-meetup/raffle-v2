// 当選可能の参加者リストを作製する

import { Participant, Mapping } from "../types/BackendTypes";

export const generatePossibleWinnersPool = (
  allParticipants: Participant[],
  allCancels: string[],
  allMappings: Mapping[]
) => {

  if (!allCancels || !allMappings || !allParticipants) {
    return []
  }

  let availableParticipants = allParticipants.filter(participant => {
    if (allCancels.includes(participant.registrationId)) {
      return false
    }
    return !!participant.connpassAttending
  })

  let pool = [...availableParticipants]
  

  for (const mapping of allMappings) {
    // 当選者がいない景品の場合はスキップ
    if (!mapping.winnerId) {
      continue
    }
    // 当選者がいる場合はプールから削除
    pool = pool.filter(participant => participant.registrationId !== mapping.winnerId)
    // 削除後にプールが0人の場合（参加者数＞景品数の場合にありえる）、プールに全員を戻してループを続ける
    // 景品リストの順序が変わらない限り、同じ結果が生成されるはず
    if (pool.length == 0) {
      pool = [...availableParticipants]
    }
  }

  return pool

}