
import React, { useState } from 'react';
import { HomeIcon, ChatBubbleLeftRightIcon, MicrophoneIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import LiveAssistant from './components/LiveAssistant';

type View = 'dashboard' | 'chat' | 'live';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <Chat />;
      case 'live':
        return <LiveAssistant closeAssistant={() => setActiveView('chat')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800 flex flex-col">
      <main className="flex-grow pb-20">
        {renderView()}
      </main>

      {activeView !== 'live' && (
         <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md">
            <nav className="flex justify-around items-center h-16 max-w-md mx-auto">
                <button 
                    onClick={() => setActiveView('dashboard')}
                    className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeView === 'dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                >
                    <HomeIcon />
                    <span className="text-xs font-medium">Home</span>
                </button>
                <button 
                    onClick={() => setActiveView('chat')}
                    className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeView === 'chat' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                >
                    <ChatBubbleLeftRightIcon />
                    <span className="text-xs font-medium">Chat</span>
                </button>
                 <button 
                    onClick={() => setActiveView('live')}
                    className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-blue-500 transition-colors duration-200"
                >
                    <MicrophoneIcon />
                    <span className="text-xs font-medium">Live AI</span>
                </button>
            </nav>
        </footer>
      )}
    </div>
  );
};

export default App;
