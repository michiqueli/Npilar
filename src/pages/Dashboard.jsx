import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import AgendaOverview from '@/components/AgendaOverview';
import ExpenseWidget from '@/components/ExpenseWidget';
import TodaySchedule from '@/components/TodaySchedule';
import FloatingExpenseButton from '@/components/FloatingExpenseButton';
import ClientCarousel from '@/components/ClientCarousel';
import DailyStatusLine from '@/components/DailyStatusLine';

const Dashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>Panel del Día - Skin Hair Studio PILAR</title>
        <meta name="description" content="Panel principal de control para gestión diaria de tu negocio." />
      </Helmet>
      
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <ClientCarousel />
        </motion.div>

        <motion.div variants={itemVariants}>
          <DailyStatusLine />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AgendaOverview />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TodaySchedule />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <ExpenseWidget />
        </motion.div>
      </motion.div>

      <FloatingExpenseButton />
    </>
  );
};

export default Dashboard;