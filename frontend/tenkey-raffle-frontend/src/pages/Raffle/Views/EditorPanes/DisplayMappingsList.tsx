import { WordWrapSpan } from "@/components/WordWrapSpan"
import { Participant, Prize, Mapping } from "@/types/BackendTypes"
import { sanitizePrizeName } from "@/util/SanitizePrizeName"
import { Table, Stack, Code, Button, Text } from "@mantine/core"
import { useEffect, useMemo } from "react"

export const DisplayMappingsList: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[],
  onRowEdit: (mapping: Mapping, overwrite: boolean) => void,
  onWinnerDelete: (mapping: Mapping) => void,
}> = ({
  participants,
  prizes,
  mappings,
  onRowEdit,
  onWinnerDelete
}) => {

    type MappingTableDataType = {
      mapping: Mapping,
      prize: Prize,
      winner: Participant | null
    }
    const mappingsTableData: MappingTableDataType[] = useMemo(() => {

      let tableData: MappingTableDataType[] = []

      for (const mapping of mappings) {
        // 景品をIDから取得
        const correspondingPrize = prizes.find(prize => prize.id === mapping.prizeId)
        if (!correspondingPrize) {
          // TODO
          continue
        }
        // 当選者が設定されてない場合、Nullを入れる
        if (!mapping.winnerId) {
          tableData.push({
            mapping: mapping,
            prize: correspondingPrize,
            winner: null
          })
        }
        // 当選者が設定されている場合、参加者を入れる
        else {
          const correspondingParticipant = participants.find(participant => participant.registrationId === mapping.winnerId)
          if (!correspondingParticipant) {
            // TODO
            continue
          }
          tableData.push({
            mapping: mapping,
            prize: correspondingPrize,
            winner: correspondingParticipant
          })
        }
      }
      return tableData

    }, [participants, prizes, mappings])


    // メニューが開かれた際、現在抽選している部分まで自動スクロール
    useEffect(() => {

      if (mappingsTableData.length > 0) {
        const scrollToIndex = mappingsTableData.findIndex(item => !item.winner) - 4
        if (scrollToIndex <= 0) { return }
        window.document.getElementById(`MappingsTable-Row-${mappingsTableData[scrollToIndex].prize.id}`).scrollIntoView()

      }

    }, [mappingsTableData])

    return (
      // <Table.ScrollContainer minWidth={600} pt={32}>
      <Table striped stickyHeader stickyHeaderOffset={60}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>景品</Table.Th>
            <Table.Th>当選者</Table.Th>
            <Table.Th>編集</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {mappingsTableData.map(entry =>
            <Table.Tr key={entry.prize.id} id={`MappingsTable-Row-${entry.prize.id}`}>
              <Table.Td>
                <Stack>
                  <Text size="xl" fw={450}><WordWrapSpan>{sanitizePrizeName(entry.prize.displayName)}</WordWrapSpan></Text>
                  <Text>by {entry.prize.provider}</Text>
                  <Text>ID: {entry.prize.id}</Text>
                </Stack>
              </Table.Td>
              <Table.Td>
                {entry.winner ?
                  <Stack>
                    <Text size="xl" fw={450}>{entry.winner.displayName}</Text>
                    <Text>{entry.winner.username}</Text>
                    <Text>受付番号: {entry.winner.registrationId}</Text>
                  </Stack>
                  :
                  <Text c="dimmed">当選者なし</Text>
                }

              </Table.Td>
              <Table.Td>
                <Stack>
                  {entry.winner ?
                    <Stack>
                      <Button
                        onClick={() => onRowEdit(entry.mapping, true)}
                      >
                        当選者の変更
                      </Button>
                      <Button
                        variant="outline" color="red"
                        onClick={() => onWinnerDelete(entry.mapping)}
                      >
                        当選者の削除
                      </Button>
                    </Stack>
                    :
                    <Button
                      variant="outline" color="green"
                      onClick={() => onRowEdit(entry.mapping, false)}
                    >
                      当選者の指定
                    </Button>
                  }
                </Stack>
              </Table.Td>
            </Table.Tr>
          )
          }
        </Table.Tbody>
      </Table>
      // </Table.ScrollContainer>
    )

  }