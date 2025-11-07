import { WordWrapSpan } from "@/components/WordWrapSpan"
import { Mapping, Participant, Prize } from "@/types/BackendTypes"
import { sanitizePrizeName } from "@/util/SanitizePrizeName"
import { Table, Stack, Group, Text, Button, Code } from "@mantine/core"
import { useMemo, useState } from "react"
import { DisplayMappingsList } from "./EditorPanes/DisplayMappingsList"
import { SelectWinner } from "./EditorPanes/SelectWinner"
import { ConfirmSelectWinner } from "./EditorPanes/ConfirmSelectWinner"
import { ConfirmDeleteWinner } from "./EditorPanes/ConfirmDeleteWinner"
import { Processing } from "./EditorPanes/Processing"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { editMappings } from "@/requests/Mappings"
import { notifications } from "@mantine/notifications"


export type EditorData = {
  mapping: Mapping | null,
  newWinner: Participant | null,
  action: "SET" | "OVERWRITE" | "DELETE"
}

export const InRaffleEditMenu: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[],
  closeMenu: () => void,
}> = ({
  participants,
  prizes,
  mappings,
  closeMenu
}) => {

    enum EditStates {
      DisplayMappingsList = 0, // 全景品表示
      ConfirmRemoveMapping,    // 当選者を削除する場合、確認画面
      SelectWinner,            // 当選者を変更する場合、選択画面
      ConfirmSelectWinner,     // 当選者を変更する場合、確認画面
      Processing,              // 編集を送信中
    }
    const [editState, setEditState] = useState<EditStates>(EditStates.DisplayMappingsList)
    const [editorData, setEditorData] = useState<EditorData>({ mapping: null, newWinner: null, action: "SET" })
    const queryClient = useQueryClient()

    const editMappingMutation = useMutation({
      mutationFn: editMappings,
      onMutate: (() => {
        setEditState(EditStates.Processing)
      }),
      onSuccess: (response => {
        console.log(response)
        notifications.show({
          color: "green",
          title: "成功",
          message: `変更を適用しました。`,
          autoClose: 5000,
        })
        queryClient.resetQueries({ queryKey: ['getMappings'] })
        closeMenu()
      }),
      onError: ((error: Error) => {
        if (error.hasOwnProperty('error')) {
          console.error(decodeURIComponent(error.message))
          notifications.show({
            color: "red",
            title: "失敗",
            message: decodeURIComponent(error.message),
            autoClose: 10000,
          })
        }
        else {
          console.error(error)
          notifications.show({
            color: "red",
            title: "失敗",
            message: error.message,
            autoClose: 10000,
          })
        }
      })
    })

    const onSelectRowToModify = (mapping: Mapping, overwrite: boolean) => {
      setEditorData({
        mapping: mapping,
        newWinner: null,
        action: overwrite ? "OVERWRITE" : "SET"
      })
      setEditState(EditStates.SelectWinner)
    }

    const onSelectRowToDelete = (mapping: Mapping) => {
      setEditorData({
        mapping: mapping,
        newWinner: null,
        action: "DELETE"
      })
      setEditState(EditStates.ConfirmRemoveMapping)
    }

    const onSelectWinnerForRow = (participant: Participant) => {
      let newEditorData = { ...editorData }
      console.log(newEditorData)
      newEditorData.newWinner = participant
      console.log(newEditorData)
      setEditorData(newEditorData)
      setEditState(EditStates.ConfirmSelectWinner)
    }


    if (editState === EditStates.DisplayMappingsList) {
      return (<DisplayMappingsList
        participants={participants}
        prizes={prizes}
        mappings={mappings}
        onRowEdit={onSelectRowToModify}
        onWinnerDelete={onSelectRowToDelete}
      />)
    }
    if (editState === EditStates.SelectWinner) {
      return (<SelectWinner
        participants={participants}
        prizes={prizes}
        currentEditorData={editorData}
        onSelectWinner={onSelectWinnerForRow}
      />)
    }

    if (editState === EditStates.ConfirmSelectWinner) {
      return (<ConfirmSelectWinner
        participants={participants}
        prizes={prizes}
        currentEditorData={editorData}
        onConfirm={() => editMappingMutation.mutate({action: editorData.action, prizeId: editorData.mapping.prizeId, winnerId: editorData.newWinner.registrationId})}
      />)
    }

    if (editState === EditStates.ConfirmRemoveMapping) {
      return (<ConfirmDeleteWinner
        participants={participants}
        prizes={prizes}
        currentEditorData={editorData}
        onConfirm={() => editMappingMutation.mutate({action: editorData.action, prizeId: editorData.mapping.prizeId, winnerId: null})}
      />)
    }

    return (<Processing />)

  }