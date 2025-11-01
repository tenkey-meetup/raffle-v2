import { Button, Stack, Table, Title, Text, Modal, Group, Container, Radio, MultiSelect, ComboboxItem, Paper } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { modifyCancelsList, wipeAllCancels } from "../../../requests/Participants";
import { Participant } from "../../../types/BackendTypes";
import { useMemo, useState } from "preact/hooks";
import { notifications } from '@mantine/notifications';
import { ConfirmDeletionModal } from "../../../components/ConfirmDeletionModal";
import { BarcodeReaderInput } from "../../../components/BarcodeReaderInput";


type CancelTableEntry = {
  cancelId: string,
  correspondingParticipant: Participant | null
}


export const CancelsView: React.FC<{
  participants: Participant[],
  cancels: string[]
}> = ({
  participants,
  cancels,
}) => {

    const [editModalOpen, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [wipeModalOpened, { open: openWipeModal, close: closeWipeModal }] = useDisclosure(false);

    const [editorAction, setEditorAction] = useState<'ADD' | 'REMOVE'>('ADD');
    const [editorMode, setEditorMode] = useState<'SCANNER' | 'MANUAL'>('MANUAL');
    const [editorList, setEditorList] = useState<string[]>([])
    const [editorTextfieldRejects, setEditorTextfieldRejects] = useState<string[]>([])

    const [editError, setEditError] = useState<string | null>(null)


    // debouncedEditorTextfield（Debounceされたバーコード入力欄）



    const queryClient = useQueryClient()

    const modifyCancelsMutation = useMutation({
      mutationFn: modifyCancelsList,
      onMutate: (() => {
        setEditError(null)
      }),
      onSuccess: (response => {
        console.log(response)
        closeEditModal()
        setEditorList([])
        setEditorTextfieldRejects([])
        notifications.show({
          color: "green",
          title: "成功",
          message: `${response.success.length}人の設定を変更しました。`,
          autoClose: 7000,
        })
        if (response.skipped.length > 0) {
          notifications.show({
            color: "gray",
            title: "警告",
            message: `編集指定されたうち${response.skipped.length}人はすでに適用済みでした。（${JSON.stringify(response.skipped)}）`,
            autoClose: 7000,
          })
        }
        if (response.nonexistentIds.length > 0) {
          notifications.show({
            color: "red",
            title: "エラー",
            message: `編集指定されたうち${response.nonexistentIds.length}人は参加者リストに含まれてなく、編集できませんでした。（${JSON.stringify(response.nonexistentIds)}）`,
            autoClose: 7000,
          })
        }
        queryClient.invalidateQueries({ queryKey: ['getCancels'] })
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

    const cancelsTableEntries: CancelTableEntry[] = cancels.map(cancelId => {
      const correspondingParticipant = participants.find(participant => participant.registrationId === cancelId)
      return {
        cancelId: cancelId,
        correspondingParticipant: correspondingParticipant || null
      }
    })

    // 参加者IDリストは便利なのでキャッシュしておく
    const participantsIdList = useMemo(() => {
      return participants.map(participant => participant.registrationId)
    }, [participants])

    const onBarcodeRead = (code: string) => {
      // 読み取ったバーコードに対応する参加者IDが存在する場合はeditorListに追加
      if (participantsIdList.includes(code)) {
        setEditorList([...editorList, code])
      }
      // 存在しない受付番号の場合は別に保管
      else {
        setEditorTextfieldRejects([...editorTextfieldRejects, code])
      }
    }

    return (
      <>
        <Modal
          opened={editModalOpen}
          onClose={closeEditModal}
          title="不参加リストの編集"
          centered
          closeOnClickOutside={!modifyCancelsMutation.isPending}
          closeOnEscape={!modifyCancelsMutation.isPending}
          withCloseButton={!modifyCancelsMutation.isPending}
        >

          <Modal.Body>
            <Stack gap="xl">
              <Radio.Group
                label="編集内容"
                name="editAction"
                value={editorAction}
                onChange={(value) => {
                  setEditorList([])
                  setEditorAction(value == "ADD" ? "ADD" : "REMOVE")
                }}
              >
                <Stack mt="xs">
                  <Radio value="ADD" label="不参加リストへ追加" />
                  <Radio value="REMOVE" label="不参加リストから削除" />
                </Stack>
              </Radio.Group>

              <Radio.Group
                label="編集モード"
                name="editMode"
                value={editorMode}
                onChange={(value) => setEditorMode(value == "MANUAL" ? "MANUAL" : "SCANNER")}
              >
                <Stack mt="xs">
                  <Radio value="MANUAL" label="手動で選択" />
                  <Radio value="SCANNER" label="バーコードリーダーで読み込む" />
                </Stack>
              </Radio.Group>

              {editorMode === "MANUAL" ?

                <MultiSelect
                  label="変更する参加者を選択"
                  description="検索時には最大20人まで表示されます。"
                  placeholder="表示名、ユーザー名、または受付番号で検索"
                  data={participants
                    .filter(participant => {
                      if (editorAction === "ADD") {
                        return !cancels.includes(participant.registrationId) ? true : false
                      } else {
                        return cancels.includes(participant.registrationId) ? true : false
                      }
                    })
                    .map(participant => {
                      return {
                        value: participant.registrationId,
                        label: `${participant.displayName}（${participant.username}、ID：${participant.registrationId}）`
                      }
                    })}
                  withScrollArea={false}
                  comboboxProps={{ withinPortal: false }}
                  styles={{ dropdown: { maxHeight: 200, overflowY: 'auto' } }}
                  limit={20}
                  filter={({ options, search }) => {
                    const filteredItems = (options as ComboboxItem[]).filter(option => option.label.toLowerCase().trim().includes(search.toLowerCase().trim()))
                    return filteredItems.slice(0, 20)
                  }}
                  searchable
                  value={editorList}
                  onChange={setEditorList}
                />

                :
                <>
                  <BarcodeReaderInput
                    label="受付番号"
                    description="バーコードをスキャンしてください。"
                    placeholder="..."
                    onSettled={onBarcodeRead}
                    clearOnSettled={true}
                  />



                  <Stack gap="sm">
                    {editorList.length > 0 &&
                      <>
                        <Text>読み取ったバーコード</Text>
                        {editorList.map(pendingId => {
                          const pendingParticipant = participants.find(participant => participant.registrationId === pendingId)
                          if (pendingParticipant) {
                            return (
                              <Paper shadow="xs" p="md">
                                <Group grow>
                                  <Text>{pendingParticipant.displayName}</Text>
                                  <Stack gap="0">
                                    <Text size="sm" c="dimmed">{pendingParticipant.displayName}</Text>
                                    <Text size="sm" c="dimmed">{pendingParticipant.registrationId}</Text>
                                  </Stack>
                                </Group>
                              </Paper>
                            )
                          } else {
                            <Group>
                              <Text c="red">???</Text>
                              <Stack gap="0">
                                <Text size="sm" c="dimmed">以下の受付番号に該当する参加者が見つかりませんでした。</Text>
                                <Text size="sm" c="dimmed">{pendingParticipant.registrationId}</Text>
                              </Stack>
                            </Group>
                          }})
                        }
                      </>
                    }
                  </Stack>

                  {editorTextfieldRejects.length > 0 &&
                    <Stack gap="sm">
                      <Text>読み取れなかったバーコード</Text>
                      <Text size="xs" c="dimmed">以下の受付番号に対応する参加者は存在しません。</Text>

                      {editorTextfieldRejects.map(rejectId =>
                      (
                        <Paper shadow="xs" p="md" bg="red.1">
                          <Group grow>
                            <Text>{rejectId}</Text>
                          </Group>
                        </Paper>
                      )
                      )
                      }
                    </Stack>

                  }
                </>

              }

            </Stack>

            <Stack align="center" gap="xs" mt="lg">
              <Text>{editorList.length}人の変更を送信します。</Text>
              <Button
                disabled={editorList.length <= 0}
                onClick={() => modifyCancelsMutation.mutate({ action: editorAction, ids: editorList })}
              >
                送信
              </Button>
            </Stack>

          </Modal.Body>

        </Modal>

        <ConfirmDeletionModal
          mutationFn={wipeAllCancels}
          invalidateQueryKeys={['getCancels']}
          modalTitle="不参加リストを削除"
          modalBodyText="現在記録されている不参加リストを削除します。"
          modalOpened={wipeModalOpened}
          closeModal={closeWipeModal}
          completeNotificationMessage="不参加リストを削除しました。"
        />

        <Stack align="center">
          <Title>不参加リスト</Title>


          <Group>
            <Button onClick={() => { setEditorTextfieldRejects([]); openEditModal(); }}>
              不参加リストの編集
            </Button>
            <Button onClick={openWipeModal} bg={cancels.length > 0 ? "red" : ""} disabled={cancels.length <= 0}>
              不参加リストを全削除
            </Button>
          </Group>
        </Stack>

        <Container>
          <Table.ScrollContainer minWidth={600} pt={32}>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>受付番号</Table.Th>
                  <Table.Th>参加者名</Table.Th>
                  <Table.Th>参加者情報</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {cancelsTableEntries.map(entry =>
                  <Table.Tr key={entry.cancelId}>
                    <Table.Td>{entry.cancelId}</Table.Td>
                    <Table.Td>
                      {entry.correspondingParticipant ?

                        <Text>{entry.correspondingParticipant.displayName}</Text>
                        :
                        <Text size="lg" c="red">???</Text>
                      }

                    </Table.Td>
                    <Table.Td>
                      {entry.correspondingParticipant ?
                        <Stack gap="xs">
                          <Text size="sm" c="dimmed">ユーザー名：{entry.correspondingParticipant.username}</Text>
                          <Text size="sm" c="dimmed">受付番号：{entry.correspondingParticipant.registrationId}</Text>
                        </Stack>
                        :
                        <Group>
                          <Text size="sm">この受付番号の参加者は参加者リストに存在しません。</Text>
                        </Group>
                      }

                    </Table.Td>
                  </Table.Tr>
                )
                }
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Container >
      </>
    )

  }