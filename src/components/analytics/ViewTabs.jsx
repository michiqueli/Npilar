import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ViewTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur-sm border">
          <TabsTrigger 
            value="resumen" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30"
          >
            Resumen
          </TabsTrigger>
          <TabsTrigger 
            value="servicios"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30"
          >
            Servicios
          </TabsTrigger>
          <TabsTrigger 
            value="historico"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30"
          >
            Histórico
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ViewTabs;