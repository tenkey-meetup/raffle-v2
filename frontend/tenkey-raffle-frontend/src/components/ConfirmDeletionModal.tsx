import { Modal, Stack, Group, Button, Text, ButtonProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { notifications } from '@mantine/notifications';

interface DeleteModalProps {
  mutationFn: () => Promise<boolean>,
  invalidateQueryKeys: string[][],
  modalTitle: string,
  modalBodyText: string,
  modalOpened: boolean,
  closeModal: () => void,
  completeNotificationMessage: string
}

// 「削除しますか？」と確認するModal
export const ConfirmDeletionModal: React.FC<DeleteModalProps> = ({
  mutationFn,          // 削除を承認した際に実行する関数
  invalidateQueryKeys, // 成功後にどのqueryKeyを無効化するか
  modalTitle,          
  modalBodyText,
  modalOpened, // Modalが開いてるかのBool（useDisclosureから）
  closeModal,  // Modalを閉じる関数（useDisclosureから）
  completeNotificationMessage // 成功後の通知に表示するメッセージ
}) => {

  const [modalError, setModalError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: mutationFn,
    onMutate: (() => {
      setModalError(null)
    }),
    onSuccess: (() => {
      console.log("Success")
      closeModal()
      notifications.show({
        color: "green",
        title: "成功",
        message: completeNotificationMessage,
        autoClose: 7000,
      })
      for (const queryKeyList of invalidateQueryKeys) {
        queryClient.invalidateQueries({
          queryKey: queryKeyList
      })
      }
      
    }),
    onError: ((error: Error) => {
      console.error(JSON.stringify(error.message))
      setModalError(JSON.stringify(error.message))
    })
  })

  return (
    <div style={{display: "block"}}>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={modalTitle}
        centered
        closeOnClickOutside={!deleteMutation.isPending}
        closeOnEscape={!deleteMutation.isPending}
        withCloseButton={!deleteMutation.isPending}
      >
        <Stack>
          <Text>
            {modalBodyText}
          </Text>
          <Group justify="flex-end">
            <Button onClick={closeModal} disabled={deleteMutation.isPending}>
              キャンセル
            </Button>
            <Button bg="red" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              削除
            </Button>
          </Group>
          {modalError &&
            <Text c="red">削除に失敗しました：{modalError}</Text>
          }
        </Stack>
      </Modal>
    </div>
  )
}

