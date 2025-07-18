import React from 'react';
import { motion } from 'framer-motion';

const SectionHeader = ({ title, description, icon: Icon }) => {
  return (
    <motion.div
      className="flex items-center space-x-4 mb-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

export default SectionHeader;