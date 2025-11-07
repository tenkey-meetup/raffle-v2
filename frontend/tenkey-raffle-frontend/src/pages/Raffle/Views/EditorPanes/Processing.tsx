import { Participant, Mapping, Prize } from "@/types/BackendTypes"
import { EditorData } from "../InRaffleEditMenu"
import { Stack, Paper, Select, ComboboxItem, Button, Text, Center, Loader } from "@mantine/core"
import { useMemo, useState } from "react"
import { DelayedDisplayLoader } from "@/components/DelayedDisplayLoader"

export const Processing: React.FC<{
}> = ({
}) => {

    return (
      <Center>
        <DelayedDisplayLoader />
      </Center>
    )
  }