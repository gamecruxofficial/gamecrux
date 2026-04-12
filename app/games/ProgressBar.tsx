import { motion } from 'framer-motion'

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-4 w-full rounded-full bg-[#020223]/50 border border-[#ff2d95]/20">
      <motion.div
        className="h-full rounded-full bg-green-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}