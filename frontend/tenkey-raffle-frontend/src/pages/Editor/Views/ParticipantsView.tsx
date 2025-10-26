import { Button, Stack, Table, Title, Text, Modal, Tooltip } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { useLocation } from "preact-iso"
import { CsvDropzone } from "../../../components/CsvDropzone";
import { FileWithPath } from "@mantine/dropzone";

export function ParticipantsView() {

  const [uploadModalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  
  // TODO
  const uploadingCsv = false
  const editingDisabled = false

  return (
    <>
      <Modal 
        opened={uploadModalOpened} 
        onClose={closeModal} 
        title="参加者CSV読み込み" 
        centered 
        closeOnClickOutside={!uploadingCsv}
        closeOnEscape={!uploadingCsv}
        withCloseButton={!uploadingCsv}
      >
        <Stack align="center">
          <CsvDropzone 
            onDropFn={(file) => console.log(file)} 
            loading={false}
            disable={false}
          />
          <Text c="red">
            既存の参加者リストは破棄されます。
          </Text>
          <Button bg="red">
            アップロード（既存のデータを上書き）
          </Button>
        </Stack>
      </Modal>
      <Stack align="center">
        <Title>参加者</Title>

        <Text>当日不参加リストは「不参加リスト」ページから編集できます。</Text>

        <Tooltip label={"抽選結果が存在する場合は書き換えできません。"} disabled={!editingDisabled}>
          <Button onClick={openModal} disabled={editingDisabled}>
            参加者CSVを読み込む
          </Button>
        </Tooltip>

        <Table stickyHeader stickyHeaderOffset={60}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>受付番号</Table.Th>
              <Table.Th>ユーザー名</Table.Th>
              <Table.Th>表示名</Table.Th>
              <Table.Th>参加ステータス</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            Todo
          </Table.Tbody>
        </Table>
      </Stack>
    </>
  )

}