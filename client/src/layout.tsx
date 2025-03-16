import './layout.css';
import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Header from './components/header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <Box as="header" py={4} px={8}>
        <Header />
      </Box>

      <Box as="main" flex={1} p={8} overflowY="auto">
        {children}
      </Box>
    </Box>
  );
};

export default Layout;