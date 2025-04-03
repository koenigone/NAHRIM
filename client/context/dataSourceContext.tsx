import React from 'react';
import { createContext, useContext, useState } from "react";

export type DataSource = "METMalaysia" | "Windy" | "OpenWeatherMap"; // Added export

interface DataSourceContextType {
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export const DataSourceProvider = ({ children }: { children: React.ReactNode }) => {
  const [dataSource, setDataSource] = useState<DataSource>("METMalaysia");

  return (
    <DataSourceContext.Provider value={{ dataSource, setDataSource }}>
      {children}
    </DataSourceContext.Provider>
  );
};

export const useDataSource = () => {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error("useDataSource must be used within a DataSourceProvider");
  }
  return context;
};