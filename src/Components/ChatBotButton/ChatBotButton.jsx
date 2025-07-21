import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router';

const ChatBotButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show button when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide button
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show button
        setIsVisible(true);
      }
      
      // Always show button when near top of page
      if (currentScrollY < 100) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);


  return (
    <Link to={'/chatbot'}>
      {/* Floating Chat Button */}
      <button
        className={`fixed bottom-14 lg:bottom-4 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center hover:scale-110 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Notification Badge */}
      {isVisible && (
        <div className="fixed bottom-24 lg:bottom-16 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-50 animate-pulse">
          1
        </div>
      )}

    </Link>
  );
};

export default ChatBotButton;