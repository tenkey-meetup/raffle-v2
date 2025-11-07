import { motion } from "motion/react"

// ワードラップを日本語設定にしたやつ
// useBudouxと組み合わせて利用
export const WordWrapSpan: React.FC<{
  children?: React.ReactNode | undefined
}> = ({
  children
}) => {
  return (
    <motion.span style={{wordBreak: "keep-all", overflowWrap: "anywhere"}}>{children}</motion.span>
  )
}