import './layout.css';
import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Header from './components/header';
import Footer from './components/footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box height="100vh" display="flex" flexDirection="column" >
      <Box as="header" py={4} px={8}>
        <Header />
      </Box>

      <Box as="main" flex={1} p={8} overflowY="auto">
        {children}
      </Box>

      <Box as="footer">
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;