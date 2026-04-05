import { motion } from 'framer-motion';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">{text}</p>
    </div>
  );
};

export default Loader;
