import { motion } from "motion/react"

export const WordWrapSpan: React.FC<{
  children?: React.ReactNode | undefined
}> = ({
  children
}) => {
  return (
    <motion.span style={{wordBreak: "keep-all", overflowWrap: "anywhere"}}>{children}</motion.span>
  )
}