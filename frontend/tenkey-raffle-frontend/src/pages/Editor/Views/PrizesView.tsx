import { Button, Stack, Table, Title, Text, Modal, Tooltip, Group, Container } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadNewParticipantsCsv, wipeAllParticipants } from "../../../requests/Participants";
import { Mapping, Participant, Prize } from "../../../types/BackendTypes";
import { useMemo, useState } from "react";
import { FileUploadBlock } from "../../../components/FileUploadBlock";
import { notifications } from '@mantine/notifications';
import { ConfirmDeletionModal } from "../../../components/ConfirmDeletionModal";
import { uploadNewPrizesCsv, wipeAllPrizes } from "../../../requests/Prizes";
import { useBudoux } from "@/util/BudouxParse";
import { WordWrapSpan } from "@/components/WordWrapSpan";
import { sanitizePrizeName } from "@/util/SanitizePrizeName";

export const PrizesView: React.FC<{
  prizes: Prize[],
  mappings: Mapping[]
}> = ({
  prizes,
  mappings
}) => {

    const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false);
    const [wipeModalOpened, { open: openWipeModal, close: closeWipeModal }] = useDisclosure(false);
    const [uploadModalError, setUploadModalError] = useState<string | null>(null)

    const queryClient = useQueryClient()
    const {budouxParser} = useBudoux()

    // 新たな景品CSVをアップロードする関数
    const uploadNewPrizesCsvMutation = useMutation({
      mutationFn: uploadNewPrizesCsv,
      onMutate: (() => {
        setUploadModalError(null)
      }),
      onSuccess: (response => {
        console.log(response)
        closeUploadModal()
        notifications.show({
          color: "green",
          title: "アップロード成功",
          message: `景品${response.parsedPrizes}個分のデータを読み込みました。`,
          autoClose: 7000,
        })
        queryClient.invalidateQueries({ queryKey: ['getPrizes'] })
        queryClient.invalidateQueries({ queryKey: ['getMappings'] })
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
          title="景品CSV読み込み"
          centered
          closeOnClickOutside={!uploadNewPrizesCsvMutation.isPending}
          closeOnEscape={!uploadNewPrizesCsvMutation.isPending}
          withCloseButton={!uploadNewPrizesCsvMutation.isPending}
        >
          <FileUploadBlock
            isLoading={uploadNewPrizesCsvMutation.isPending}
            isDisabled={editingDisabled}
            errorMsg={uploadModalError}
            onSubmit={uploadNewPrizesCsvMutation.mutate}
            warningText="既存の景品リストは破棄されます。"
          />
        </Modal>

        <ConfirmDeletionModal
          mutationFn={wipeAllPrizes}
          invalidateQueryKeys={[['getPrizes'], ['getMappings']]}
          modalTitle="景品リストを削除"
          modalBodyText="現在アップロードされている景品リストを削除します。"
          modalOpened={wipeModalOpened}
          closeModal={closeWipeModal}
          completeNotificationMessage="景品リストを削除しました。"
        />

        <Stack align="center">
          <Title>景品リスト</Title>

          <Tooltip label={"抽選結果が存在する場合は書き換えできません。"} disabled={!editingDisabled}>
            <Group>
              <Button onClick={openUploadModal} disabled={editingDisabled}>
                景品CSVを読み込む
              </Button>
              <Button onClick={openWipeModal} disabled={editingDisabled} variant="outline" color={editingDisabled ? "" : "red"}>
                景品リストを削除
              </Button>
            </Group>
          </Tooltip>
        </Stack>

        <Container>
          <Table.ScrollContainer minWidth={600} pt={32}>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>管理No</Table.Th>
                  <Table.Th>提供元</Table.Th>
                  <Table.Th>景品名</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {prizes.map(prize =>
                  <Table.Tr key={prize.id}>
                    <Table.Td>{prize.id}</Table.Td>
                    <Table.Td>{prize.provider}</Table.Td>
                    <Table.Td><WordWrapSpan>{budouxParser(sanitizePrizeName(prize.displayName))}</WordWrapSpan></Table.Td>
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