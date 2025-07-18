import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange, serviceCounts }) => {
  const orderedCategories = ['Todos', ...categories.slice(1).sort((a, b) => {
    const countA = serviceCounts?.[a] || 0;
    const countB = serviceCounts?.[b] || 0;
    return countB - countA;
  })];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {orderedCategories.map((category, index) => {
          const count = serviceCounts?.[category] || 0;
          const isActive = selectedCategory === category;
          
          if (category !== 'Todos' && count === 0) return null;

          return (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                'px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 relative border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground border-border'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{category}</span>
              <span className={cn(
                'ml-2 px-2 py-0.5 text-xs rounded-full',
                isActive 
                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              )}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;