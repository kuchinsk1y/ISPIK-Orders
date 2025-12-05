import { motion } from "framer-motion"

const variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const transition = { duration: 0.25 }

const PageTransition = ({ children, className = "" }) => {
  return (
    <motion.div className={className} initial="initial" animate="animate" exit="exit" variants={variants} transition={transition}>
      {children}
    </motion.div>
  )
}

export default PageTransition
