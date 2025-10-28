import { Button, Stack, Table, Title, Text, Tooltip } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { wipeMappings } from "../../../requests/Mappings";
import { Mapping, Participant, Prize } from "../../../types/BackendTypes";
import { ConfirmDeletionModal } from "../../../components/ConfirmDeletionModal";


type mappingsTableEntries = {
  prize: Prize,
  participant: Participant | null | string // Null -> 当選者が存在しない、string -> 当選者は存在するけど同一IDの参加者データが見つからない
}

export const MappingsView: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[],
}> = ({
  participants,
  prizes,
  mappings,
}) => {

  // Map prizes to winners if any
  const tableData: mappingsTableEntries[] = prizes.map(prize => {
    const mappingForPrize = mappings.find(mapping => mapping.prizeId == prize.id)
    if (mappingForPrize) {
      const participantForMapping = participants.find(participant => participant.registrationId == mappingForPrize.participantId)
      return {
        prize: prize,
        participant: participantForMapping || mappingForPrize.participantId
      }
    } else {
      return {
        prize: prize,
        participant: null
      }
    }
  })

  const [wipeModalOpen, { open: openWipeModal, close: closeWipeModal }] = useDisclosure(false);


  return (
    <>
      <ConfirmDeletionModal
        mutationFn={wipeMappings}
        invalidateQueryKeys={['getMappings']}
        modalTitle="抽選結果を全削除"
        modalBodyText="現在存在する抽選結果をすべて削除してリセットします。"
        modalOpened={wipeModalOpen}
        closeModal={closeWipeModal}
        completeNotificationMessage="抽選結果を削除しました。"
      />

      <Stack align="center">
        <Title>抽選結果</Title>

        <Text>こちらはデータ管理・編集メニューです。</Text>
        <Text>抽選後の景品受け渡し用のページはメニューに別途あります。</Text>

        <Tooltip label={"抽選結果が存在しません。"} disabled={mappings.length > 0}>
          <Button bg={mappings.length > 0 ? "red" : ""} onClick={openWipeModal} disabled={mappings.length <= 0}>
            抽選結果を全削除（リセット）
          </Button>

        </Tooltip>

        <Table stickyHeader stickyHeaderOffset={60} striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>景品</Table.Th>
              <Table.Th>当選者</Table.Th>
              <Table.Th>管理</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tableData.map(entry =>
              <Table.Tr key={entry.prize.id}>
                {/* Prize */}
                <Table.Td>
                  <Stack gap="xs">
                    <Text size="xl">{entry.prize.id}</Text>
                    <Text size="sm" dangerouslySetInnerHTML={{ __html: entry.prize.displayName }} />
                    <Text size="sm" c="dimmed">提供者：{entry.prize.provider}</Text>
                  </Stack>
                </Table.Td>
                {/* Participant */}
                <Table.Td>
                  {entry.participant === null ?
                    <Stack>
                      <Text>当選者なし</Text>
                    </Stack>
                    :
                    (
                      typeof entry.participant === "string" ?
                        <Stack gap="xs">
                          <Text c="red" fw={700} size="xl">ID: {entry.participant}</Text>
                          <Text c="red" size="sm">該当する参加者が参加者リストに見つかりませんでした。</Text>
                        </Stack>
                        :
                        <Stack gap="xs">
                          <Text size="xl">{entry.participant.displayName}</Text>
                          <Text size="sm">ユーザー名：{entry.participant.username}</Text>
                          <Text size="sm" c="dimmed">整理番号：{entry.participant.registrationId}</Text>
                        </Stack>
                    )
                  }
                </Table.Td>
                {/* Management */}
                <Table.Td>
                  <Stack>
                    <Button>
                      当選者を{entry.participant ? "変更" : "指定"}
                    </Button>
                    <Button bg={entry.participant ? "red" : ""} disabled={entry.participant ? false : true}>
                      当選者の削除
                    </Button>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            )
            }
          </Table.Tbody>
        </Table>
      </Stack>
    </>
  )

}