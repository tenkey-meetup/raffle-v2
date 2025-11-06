import { useState } from "react"
import { Mapping, Participant, Prize } from "../../../types/BackendTypes"
import { AwaitingWinnerBarcode } from "./AwaitingWinnerBarcode"
import { Stepper, Group, Button, Container } from "@mantine/core"
import { AwaitingPrizeConfirmation } from "./AwaitingPrizeConfirmation"


enum HandoffStates {
  AwaitingWinnerBarcode = 0,
  AwaitingPrizeConfirmation,
}

const HandoffStateNames = Object.getOwnPropertyNames(HandoffStates).filter(entry => isNaN(Number(entry)))

export const MainView: React.FC<{
  participants: Participant[],
  prizes: Prize[],
  mappings: Mapping[]
}> = ({
  participants,
  prizes,
  mappings
}) => {

    const [handoffState, setHandoffState] = useState<HandoffStates>(HandoffStates.AwaitingWinnerBarcode)
    const [pendingPrizeId, setPendingPrizeId] = useState<string | null>(null)
    const [pendingParticipantId, setPendingParticipantId] = useState<string | null>(null)
    
    const setPendingPrizeDetails = (prizeId: string, participantId: string) => {
      setPendingPrizeId(prizeId)
      setPendingParticipantId(participantId)
      setHandoffState(HandoffStates.AwaitingPrizeConfirmation)
    } 



    return (
      <>
        <Container>
          <Stepper active={handoffState} allowNextStepsSelect={false} pt={8} pb={24}>
            <Stepper.Step label="ステップ１" description="当選者のバーコード読み取り">
              
            </Stepper.Step>
            <Stepper.Step label="ステップ２" description="景品の確認">
              
            </Stepper.Step>
            <Stepper.Step label="ステップ３" description="景品の受け渡し">
              
            </Stepper.Step>
            <Stepper.Completed>
              Completed, click back button to get to previous step
            </Stepper.Completed>
          </Stepper>
        </Container>
        {handoffState == HandoffStates.AwaitingWinnerBarcode &&
          <AwaitingWinnerBarcode
            participants={participants}
            prizes={prizes}
            mappings={mappings}
            setPendingPrizeDetails={setPendingPrizeDetails}
          />
        }
        {handoffState == HandoffStates.AwaitingPrizeConfirmation &&
          <AwaitingPrizeConfirmation
            participants={participants}
            prizes={prizes}
            pendingParticipantId={pendingParticipantId}
            pendingPrizeId={pendingPrizeId}
          />
        }
      </>
    )
  }