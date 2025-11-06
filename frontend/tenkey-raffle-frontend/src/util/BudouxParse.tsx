import { loadDefaultJapaneseParser } from 'budoux'
import { motion } from 'motion/react'
const jaParser = loadDefaultJapaneseParser()

export const useBudoux = () => {

  const budouxParser = (inputText: string) => {
    return (
      <motion.span style={{wordBreak: "keep-all", overflowWrap: "anywhere"}}>
        {jaParser.parse(inputText).join("​")}
      </motion.span>
    )
    // return (
    //   <>
    //   {jaParser.parse(inputText).map((entry, index) => (
    //     <motion.span style={{display: "inline-block", whiteSpace: "nowrap", wordBreak: "keep-all", overflowWrap: "anywhere"}} key={`budoux-${inputText}-${index}-${entry}`}>{entry}</motion.span>
    //   ))}
    //   </>
    // )
  }

  return {
    budouxParser
  }

}