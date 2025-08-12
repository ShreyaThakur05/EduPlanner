import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-cream-50 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 w-full overflow-auto">
        <div className="h-full w-full p-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;