import { Participant, Mapping, Prize } from "@/types/BackendTypes"
import { EditorData } from "../InRaffleEditMenu"
import { Stack, Paper, Select, ComboboxItem, Button, Text, Center, Loader } from "@mantine/core"
import { useMemo, useState } from "react"

export const Processing: React.FC<{
}> = ({
}) => {

    return (
      <Center>
        <Loader />
      </Center>
    )
  }