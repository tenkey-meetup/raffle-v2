import { Button, Stack, Table, Title, Text, Modal, Tooltip, Group, Box, Container } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadNewParticipantsCsv, wipeAllParticipants } from "../../../requests/Participants";
import { Mapping, Participant } from "../../../types/BackendTypes";
import { useMemo, useState } from "react";
import { FileUploadBlock } from "../../../components/FileUploadBlock";
import { notifications } from '@mantine/notifications';
import { ConfirmDeletionModal } from "../../../components/ConfirmDeletionModal";

export const ParticipantsView: React.FC<{
  participants: Participant[],
  cancels: string[]
  mappings: Mapping[]
}> = ({
  participants,
  cancels,
  mappings
}) => {

    const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false);
    const [wipeModalOpened, { open: openWipeModal, close: closeWipeModal }] = useDisclosure(false);
    const [uploadModalError, setUploadModalError] = useState<string | null>(null)

    const queryClient = useQueryClient()

    // 新たな参加者CSVをアップロードする関数
    const uploadNewParticipantsCsvMutation = useMutation({
      mutationFn: uploadNewParticipantsCsv,
      onMutate: (() => {
        setUploadModalError(null)
      }),
      onSuccess: (response => {
        console.log(response)
        closeUploadModal()
        notifications.show({
          color: "green",
          title: "アップロード成功",
          message: `${response.parsedParticipants}人分のデータを読み込みました。`,
          autoClose: 7000,
        })
        queryClient.invalidateQueries({ queryKey: ['getParticipants'] })
      }),
      onError: ((error: Error) => {
        console.log(error)
        if (error.hasOwnProperty('error')) {
          setUploadModalError(decodeURIComponent(error.message))
        }
        else {
          setUploadModalError(error.message)
        }
      })
    })

    // 抽選結果が存在する場合は書き換え機能を切る
    const editingDisabled = useMemo(() => {
      return mappings.filter(entry => entry.winnerId).length > 0
    }, [mappings])

    return (
      <>
        <Modal
          opened={uploadModalOpened}
          onClose={closeUploadModal}
          title="参加者CSV読み込み"
          centered
          closeOnClickOutside={!uploadNewParticipantsCsvMutation.isPending}
          closeOnEscape={!uploadNewParticipantsCsvMutation.isPending}
          withCloseButton={!uploadNewParticipantsCsvMutation.isPending}
        >
          <FileUploadBlock
            isLoading={uploadNewParticipantsCsvMutation.isPending}
            isDisabled={editingDisabled}
            errorMsg={uploadModalError}
            onSubmit={uploadNewParticipantsCsvMutation.mutate}
            warningText="既存の参加者リストは破棄されます。"
          />
        </Modal>

        <ConfirmDeletionModal
          mutationFn={wipeAllParticipants}
          invalidateQueryKeys={[['getParticipants']]}
          modalTitle="参加者リストを削除"
          modalBodyText="現在アップロードされている参加者リストを削除します。"
          modalOpened={wipeModalOpened}
          closeModal={closeWipeModal}
          completeNotificationMessage="参加者リストを削除しました。"
        />

        <Stack align="center">
          <Title>参加者</Title>

          <Text>当日不参加リストは「不参加リスト」ページから編集できます。</Text>

          <Tooltip label={"抽選結果が存在する場合は書き換えできません。"} disabled={!editingDisabled}>
            <Group>
              <Button onClick={openUploadModal} disabled={editingDisabled}>
                参加者CSVを読み込む
              </Button>
              <Button onClick={openWipeModal} disabled={editingDisabled} variant="outline" color={editingDisabled ? "" : "red"}>
                参加者リストを削除
              </Button>
            </Group>
          </Tooltip>
        </Stack>
        <Container>
        <Table.ScrollContainer minWidth={600} pt={32}>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>受付番号</Table.Th>
                <Table.Th>ユーザー名</Table.Th>
                <Table.Th>表示名</Table.Th>
                <Table.Th>参加ステータス（connpass上）</Table.Th>
                <Table.Th>当日不参加</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {participants.map(participant =>
                <Table.Tr key={participant.registrationId}>
                  <Table.Td>{participant.registrationId}</Table.Td>
                  <Table.Td>{participant.username}</Table.Td>
                  <Table.Td>{participant.displayName}</Table.Td>
                  <Table.Td>{participant.connpassAttending ? <Text fw={500} c="green">✓</Text> : <Text fw={500} c="red">✗</Text>}</Table.Td>
                  <Table.Td>{cancels.includes(participant.registrationId) ? <Text fw={500} c="red">✓</Text> : <Text c="dimmed">-</Text>}</Table.Td>
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