// import React from 'react';
// import Header from '../Header/Header';    // ← путь изменился
// import Footer from '../Footer/Footer';    // ← путь изменился
// import './Layout.css';

// function Layout({ children }) {
//   return (
//     <div className="layout">
//       <Header />
//       <main className="main-content">
//         {children}
//       </main>
//       <Footer />
//     </div>
//   );
// }

// export default Layout;

import React, { useState } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import AuthModal from '../AuthModal/AuthModal';
import './Layout.css';

function Layout({ children }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer onAuthRequired={handleAuthRequired} />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={() => {}}
      />
    </div>
  );
}

export default Layout;