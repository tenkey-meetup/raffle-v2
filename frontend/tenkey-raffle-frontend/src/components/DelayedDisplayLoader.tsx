import { Loader } from "@mantine/core"
import { motion } from "motion/react"

export const DelayedDisplayLoader: React.FC<{

}> = ({

}) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3, bounce: 0, type: "spring" }}
      >
        <Loader />
      </motion.div>
    )
  }