import { Modal, Stack, Group, Button, Text, ButtonProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { notifications } from '@mantine/notifications';

interface DeleteModalProps {
  mutationFn: () => Promise<boolean>,
  invalidateQueryKeys: string[],
  modalTitle: string,
  modalBodyText: string,
  modalOpened: boolean,
  closeModal: () => void,
  completeNotificationMessage: string
}

export const ConfirmDeletionModal: React.FC<DeleteModalProps> = ({
  mutationFn,
  invalidateQueryKeys,
  modalTitle,
  modalBodyText,
  modalOpened,
  closeModal,
  completeNotificationMessage
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
      queryClient.invalidateQueries({
        queryKey: invalidateQueryKeys
      })
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

