import { Button, Stack, Table, Title, Text, Tooltip, Container, Modal, Paper, Space, Select, ComboboxItem } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { editMappings, wipeMappings } from "../../../requests/Mappings";
import { Mapping, Participant, Prize } from "../../../types/BackendTypes";
import { ConfirmDeletionModal } from "../../../components/ConfirmDeletionModal";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { WordWrapSpan } from "@/components/WordWrapSpan";
import { sanitizePrizeName } from "@/util/SanitizePrizeName";
import { useBudoux } from "@/util/BudouxParse";


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

    const [wipeModalOpen, { open: openWipeModal, close: closeWipeModal }] = useDisclosure(false);
    const [mappingEditModalOpen, { open: openEditMappingModal, close: closeEditMappingModal }] = useDisclosure(false);
    const [mappingDeleteModalOpen, { open: openDeleteMappingModal, close: closeDeleteMappingModal }] = useDisclosure(false);
    const [currentRow, setCurrentRow] = useState<Prize | null>(null) // 現在編集中の景品Row
    const [currentEditorValue, setCurrentEditorValue] = useState<string | null>('');
    const [editError, setEditError] = useState<string | null>(null)

    let currentRowWinner: Participant | null = null
    if (currentRow) {
      const currentMapping = mappings.find(entry => entry.prizeId === currentRow.id)
      if (currentMapping) {
        currentRowWinner = participants.find(participant => participant.registrationId === currentMapping.winnerId) || null
      }
    }

    const queryClient = useQueryClient()
    const { budouxParser } = useBudoux()

    const editMappingMutation = useMutation({
      mutationFn: editMappings,
      onMutate: (() => {
        setEditError(null)
      }),
      onSuccess: (response => {
        console.log(response)
        closeEditMappingModal()
        closeDeleteMappingModal()
        setCurrentRow(null)
        notifications.show({
          color: "green",
          title: "成功",
          message: `変更を適用しました。`,
          autoClose: 7000,
        })
        queryClient.invalidateQueries({ queryKey: ['getMappings'] })
      }),
      onError: ((error: Error) => {
        console.log(error)
        if (error.hasOwnProperty('error')) {
          setEditError(decodeURIComponent(error.message))
        }
        else {
          setEditError(error.message)
        }
      })
    })


    // Mappingsに対応する参加者と景品データを検索
    const tableData: mappingsTableEntries[] = useMemo(() => mappings.map(mapping => {
      const prizeForMapping = prizes.find(prize => prize.id == mapping.prizeId)
      if (!prizeForMapping) {
        console.error("Invalid prize")
        console.error(mapping)
        notifications.show({
          color: "red",
          title: "エラー",
          message: `ID ${mapping.prizeId}の景品が景品リストに見つかりませんでした。（MappingsView）`,
          autoClose: 7000,
        })
        return undefined
      }

      if (mapping.winnerId) {
        const participantForMapping = participants.find(participant => participant.registrationId == mapping.winnerId)
        return {
          prize: prizeForMapping,
          participant: participantForMapping || mapping.winnerId // Display handles errors
        }

      } else {
        return {
          prize: prizeForMapping,
          participant: null
        }
      }
    }), [mappings, prizes, participants])


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

        <Modal
          opened={mappingEditModalOpen}
          onClose={closeEditMappingModal}
          title="景品の当選者の編集"
          centered
          closeOnClickOutside={!editMappingMutation.isPending}
          closeOnEscape={!editMappingMutation.isPending}
          withCloseButton={!editMappingMutation.isPending}
        >
          <Modal.Body>
            <Stack>
              以下の景品の当選者を編集します。
              <Paper shadow="xs" p="xl" withBorder>
                {currentRow &&
                  <Stack gap="xs" align="center" ta="center">
                    <Text size="xl" ta="center"><WordWrapSpan>{budouxParser(sanitizePrizeName(currentRow.displayName))}</WordWrapSpan></Text>
                    <Text size="sm" c="dimmed">{currentRow.id}</Text>
                    <Text size="sm" c="dimmed">{currentRow.provider}</Text>
                  </Stack>
                }
              </Paper>
              {currentRowWinner ?
                <>
                  <Text>
                    現在の当選者は以下の参加者です。
                  </Text>
                  <Paper shadow="xs" p="xl" withBorder>
                    <Stack gap="xs" align="center">
                      <Text size="xl">{currentRowWinner.displayName}</Text>
                      <Text size="sm" c="dimmed">{currentRowWinner.username}</Text>
                      <Text size="sm" c="dimmed">{currentRowWinner.registrationId}</Text>
                    </Stack>
                  </Paper>
                </>
                :
                <Text>
                  現在この景品に当選者はいません。
                </Text>
              }
              <Select
                mt={8}
                label="当選者の選択"
                description="検索時には最大20人まで表示されます。"
                placeholder="表示名、ユーザー名、または受付番号で検索"
                data={participants
                  .filter(participant => participant.registrationId !== currentRowWinner?.registrationId)
                  .map(participant => {
                    return {
                      value: participant.registrationId,
                      label: `${participant.displayName}（${participant.username}、ID：${participant.registrationId}）`
                    }
                  })}
                searchable
                comboboxProps={{ withinPortal: false }}
                withScrollArea={false}
                styles={{ dropdown: { maxHeight: 200, overflowY: 'auto' } }}
                limit={20}
                filter={({ options, search }) => {
                  const filteredItems = (options as ComboboxItem[]).filter(option => option.label.toLowerCase().trim().includes(search.toLowerCase().trim()))
                  return filteredItems.slice(0, 20)
                }}
                onChange={setCurrentEditorValue}
                value={currentEditorValue}
              />
              <Button
                disabled={!currentEditorValue}
                onClick={() => editMappingMutation.mutate({ action: 'OVERWRITE', prizeId: currentRow.id, winnerId: currentEditorValue })}
              >
                当選者を変更
              </Button>
            </Stack>
          </Modal.Body>
        </Modal>

        <Modal
          opened={mappingDeleteModalOpen}
          onClose={closeDeleteMappingModal}
          title="景品の当選者の削除"
          centered
          closeOnClickOutside={!editMappingMutation.isPending}
          closeOnEscape={!editMappingMutation.isPending}
          withCloseButton={!editMappingMutation.isPending}
        >
          <Modal.Body>
            <Stack>
              以下の景品の当選者を削除します。
              <Paper shadow="xs" p="xl" bg="gray.1">
                {currentRow &&
                  <Stack gap="xs" align="center">
                    <Text size="xl" dangerouslySetInnerHTML={{ __html: currentRow.displayName }} />
                    <Text size="sm" c="dimmed">{currentRow.id}</Text>
                    <Text size="sm" c="dimmed">{currentRow.provider}</Text>
                  </Stack>
                }
              </Paper>
              {currentRowWinner ?
                <>
                  <Text>
                    現在の当選者は以下の参加者です。
                  </Text>
                  <Paper shadow="xs" p="xl" bg="gray.1">
                    <Stack gap="xs" align="center">
                      <Text size="xl">{currentRowWinner.displayName}</Text>
                      <Text size="sm" c="dimmed">{currentRowWinner.username}</Text>
                      <Text size="sm" c="dimmed">{currentRowWinner.registrationId}</Text>
                    </Stack>
                  </Paper>
                </>
                :
                <Text>
                  現在この景品に当選者はいません。
                </Text>
              }
              <Button
                bg="red"
                onClick={() => editMappingMutation.mutate({ action: 'DELETE', prizeId: currentRow.id, winnerId: currentEditorValue })}
              >
                当選者を削除
              </Button>
              {editError && 
                <Text c="red">{editError}</Text>
              }
            </Stack>
          </Modal.Body>
        </Modal>

        <Stack align="center">
          <Title>抽選結果</Title>

          <Text>こちらはデータ管理・編集メニューです。</Text>
          <Text>抽選後の景品受け渡し用のページはメニューに別途あります。</Text>

          <Tooltip label={"抽選結果が存在しません。"} disabled={mappings.length > 0}>
            <Button bg={mappings.length > 0 ? "red" : ""} onClick={openWipeModal} disabled={mappings.length <= 0}>
              抽選結果を全削除（リセット）
            </Button>

          </Tooltip>
        </Stack>

        <Container>
          <Table.ScrollContainer minWidth={600} pt={32}>
            <Table striped>
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
                              <Text size="sm" c="dimmed">受付番号：{entry.participant.registrationId}</Text>
                            </Stack>
                        )
                      }
                    </Table.Td>
                    {/* Management */}
                    <Table.Td>
                      <Stack>
                        <Button
                          onClick={() => {
                            setCurrentRow(entry.prize);
                            setCurrentEditorValue(null)
                            openEditMappingModal();
                          }}
                          color={entry.participant ? "blue" : "green"}
                          variant={entry.participant ? "solid" : "outline"}
                        >
                          当選者を{entry.participant ? "変更" : "指定"}
                        </Button>
                        <Button
                          color={entry.participant ? "red" : ""}
                          variant="outline"
                          disabled={entry.participant ? false : true}
                          onClick={() => {
                            setCurrentRow(entry.prize);
                            openDeleteMappingModal();
                          }}
                        >
                          当選者の削除
                        </Button>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                )
                }
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Container>
      </>
    )

  }