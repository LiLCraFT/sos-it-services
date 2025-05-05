import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { LifeBuoy, ArrowRight, Monitor, Percent, Zap, CreditCard, Settings, Clock, Send, Users, BadgeCheck } from 'lucide-react';
import { FaApple } from 'react-icons/fa';

const Hero: React.FC = () => {
  const whatsappNumber = "33695358625"; // Même numéro que dans Navbar
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  
  // Animation states for dynamic conversation
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState(-1);
  const [typingText, setTypingText] = useState("");
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [indicatorPosition, setIndicatorPosition] = useState("user"); // "user" or "assistant"
  
  // Messages for the conversation
  const messages = [
    { sender: "user", text: "Mon PC est très lent, pouvez-vous m'aider ?", time: "10:15" },
    { sender: "assistant", text: "Un expert est disponible ! Résolution en 30min garantie ou remboursé.", time: "10:15" },
    { sender: "user", text: "Parfait ! On commence ?", time: "10:16" }
  ];
  
  // Handle typing animation effect
  useEffect(() => {
    if (typingMessageIndex >= 0 && typingMessageIndex < messages.length) {
      const fullText = messages[typingMessageIndex].text;
      if (typingText.length < fullText.length) {
        const timer = setTimeout(() => {
          setTypingText(fullText.substring(0, typingText.length + 1));
        }, 20);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
        setTypingMessageIndex(-1);
        setShowTypingIndicator(false);
        setVisibleMessages(prev => {
          const newValue = prev + 1;
          // If we've shown all messages, mark the animation as complete after the pause
          if (newValue >= messages.length) {
            setTimeout(() => {
              setIsAnimationRunning(false);
            }, 4000); // 4 second pause after showing all messages
          }
          return newValue;
        });
      }
    }
  }, [typingText, typingMessageIndex, messages]);
  
  // Start the conversation animation
  useEffect(() => {
    let animationTimer: ReturnType<typeof setTimeout>;
    
    // Function to check and start animation cycle if not running
    const checkAndStartAnimation = () => {
      if (!isAnimationRunning) {
        startAnimationCycle();
      }
      animationTimer = setTimeout(checkAndStartAnimation, 1000); // Check every second
    };
    
    // Function to reset and start animation cycle
    const startAnimationCycle = () => {
      // Only start if not already running
      if (isAnimationRunning) return;
      
      setIsAnimationRunning(true);
      
      // Reset states
      setVisibleMessages(0);
      setIsTyping(false);
      setTypingMessageIndex(-1);
      setTypingText("");
      setShowTypingIndicator(false);
      
      // Schedule the full conversation with typing indicators
      const schedule = [
        { time: 300, action: () => { 
          setShowTypingIndicator(true); 
          setIndicatorPosition("user"); 
        }},
        { time: 1500, action: () => { 
          setShowTypingIndicator(false);
          setIsTyping(true);
          setTypingMessageIndex(0);
        }},
        { time: 3500, action: () => {
          setShowTypingIndicator(true);
          setIndicatorPosition("assistant");
        }},
        { time: 4700, action: () => {
          setShowTypingIndicator(false);
          setIsTyping(true);
          setTypingMessageIndex(1);
        }},
        { time: 7000, action: () => {
          setShowTypingIndicator(true);
          setIndicatorPosition("user");
        }},
        { time: 8200, action: () => {
          setShowTypingIndicator(false);
          setIsTyping(true);
          setTypingMessageIndex(2);
        }}
      ];
      
      schedule.forEach(item => {
        setTimeout(item.action, item.time);
      });
    };
    
    // Start checking immediately
    checkAndStartAnimation();
    
    // Cleanup function to clear any pending timeouts when component unmounts
    return () => {
      clearTimeout(animationTimer);
    };
  }, [isAnimationRunning]);
  
  // Function to render message bubble with typing animation
  const renderMessage = (message: typeof messages[0], index: number) => {
    const isUser = message.sender === "user";
    const isCurrentlyTyping = isTyping && typingMessageIndex === index;
    const isVisible = index < visibleMessages || isCurrentlyTyping;
    
    if (!isVisible) return null;
    
    return (
      <div key={index} className={`flex ${isUser ? "" : "justify-end"}`}>
        <div className={`${isUser ? "bg-white bg-opacity-5 rounded-lg rounded-tl-none" : "bg-[#5865F2] rounded-lg rounded-tr-none"} p-2 sm:p-3 max-w-[80%] relative`}>
          <p className={`${isUser ? "text-gray-300" : "text-white"} text-xs sm:text-sm`}>
            {isCurrentlyTyping ? typingText : message.text}
            {isCurrentlyTyping && <span className="inline-block w-1 h-3 ml-1 bg-gray-400 animate-pulse"></span>}
          </p>
          <p className={`${isUser ? "text-white" : "text-white"} text-[8px] sm:text-[10px] mt-1`}>{message.time} {isUser ? "✓" : "✓✓"}</p>
        </div>
      </div>
    );
  };
  
  // Render the typing indicator ("...")
  const renderTypingIndicator = () => {
    if (!showTypingIndicator) return null;
    
    const isUser = indicatorPosition === "user";
    
    return (
      <div className={`flex ${isUser ? "" : "justify-end"}`}>
        <div className={`${isUser ? "bg-white bg-opacity-5 rounded-lg rounded-tl-none" : "bg-[#5865F2] rounded-lg rounded-tr-none"} p-2 sm:p-3 max-w-[80%] relative min-w-[40px]`}>
          <p className={`${isUser ? "text-gray-300" : "text-white"} text-xs sm:text-sm flex items-center`}>
            <span className="flex items-center gap-[3px]">
              <span className="inline-block w-1 h-1 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="inline-block w-1 h-1 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span className="inline-block w-1 h-1 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '600ms' }}></span>
            </span>
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div id="home" className="relative min-h-screen bg-[#36393F] pt-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-[#5865F2] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-[#5865F2] opacity-10 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 pl-0 mb-10 lg:mb-0" style={{ marginLeft: "3%" }}>
            {/* Ajout de l'image de fond */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
              <div className="relative w-full h-full">
                <img 
                  src="/images/headset-support.png" 
                  alt="Support background" 
                  className="absolute top-[80px] sm:top-[100px] md:top-[120px] left-[30%] transform -translate-x-1/2 h-[570px] sm:h-[610px] md:h-[650px] opacity-5"
                />
              </div>
            </div>
            
            <div className="relative z-10 p-6 pl-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#5865F2] bg-opacity-20 text-[#5865F2] mb-6">
                <Users size={16} className="mr-2" />
                <span className="text-sm font-medium">Communauté d'experts</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                <div>Votre diagnostic gratuit</div>
                <div className="text-[#5865F2]">Satisfait ou remboursé</div>
              </h1>
              <p className="text-gray-300 text-lg mb-8 max-w-xl">
              Confiez vos soucis informatiques à des professionnels. Intervention rapide à distance, avec garantie satisfait ou remboursé. Que ce soit pour un bug, un PC lent ou une aide technique, on s'occupe de tout, depuis chez vous.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md font-medium transition-all duration-200 inline-flex items-center justify-center bg-[#5865F2] text-white hover:bg-opacity-90 px-6 py-3 text-lg"
                >
                  Diagnostic gratuit
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md font-medium transition-all duration-200 inline-flex items-center justify-center border border-white/20 bg-transparent hover:bg-white/10 text-white px-6 py-3 text-lg group"
                >
                  Discuter avec un expert
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </a>
              </div>
              
              <div className="mt-10">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full border-2 border-[#36393F] bg-[#5865F2] flex items-center justify-center text-white">
                      <Monitor size={18} />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-[#36393F] bg-[#5865F2] flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12" y2="18" />
                      </svg>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-[#36393F] bg-[#5865F2] flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="8" width="16" height="12" rx="2" ry="2" />
                        <line x1="8" y1="12" x2="8" y2="12" />
                        <line x1="12" y1="12" x2="12" y2="12" />
                        <line x1="16" y1="12" x2="16" y2="12" />
                        <line x1="8" y1="16" x2="8" y2="16" />
                        <line x1="12" y1="16" x2="12" y2="16" />
                        <line x1="16" y1="16" x2="16" y2="16" />
                        <line x1="2" y1="4" x2="22" y2="4" />
                      </svg>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-[#36393F] bg-[#5865F2] flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                      </svg>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-[#36393F] bg-[#5865F2] flex items-center justify-center text-white">
                      <FaApple size={18} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">Dépannage de tous vos appareils</div>
                    <div className="text-xs text-gray-400">PC, Mobile, Internet, Imprimante, Apple</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* iPhone section */}
          <div className="lg:w-1/2 mt-10 lg:mt-0 relative z-10 p-8 pr-0" style={{ marginRight: "-3%" }}>
            <div className="relative flex justify-center lg:justify-end xl:justify-center 2xl:justify-end xl:pr-12 2xl:pr-24">
              {/* iPhone container with halo */}
              <div className="relative w-[280px] sm:w-[300px] md:w-[320px] lg:translate-x-12 xl:translate-x-0 2xl:translate-x-12">
                {/* Halo effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2] to-[#EB459E] rounded-[55px] blur-md opacity-20"></div>

                {/* iPhone 16 design */}
                <div className="relative bg-black rounded-[55px] overflow-hidden border-[3px] border-gray-800 shadow-xl 
                    h-[570px] 
                    sm:h-[610px] 
                    md:h-[650px]">
                  {/* Dynamic Island */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[100px] sm:w-[110px] md:w-[120px] h-[30px] sm:h-[32px] md:h-[35px] bg-black rounded-full z-20 flex items-center justify-center">
                    {/* Camera dot */}
                    <div className="absolute right-5 sm:right-6 w-[10px] sm:w-[11px] md:w-[12px] h-[10px] sm:h-[11px] md:h-[12px] rounded-full bg-[#1a1a1a] flex items-center justify-center">
                      <div className="w-[5px] sm:w-[6px] h-[5px] sm:h-[6px] rounded-full bg-[#2a2a2a]">
                        <div className="w-[2px] sm:w-[3px] h-[2px] sm:h-[3px] rounded-full bg-[#3a3a3a]"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Screen content with curved corners */}
                  <div className="relative h-full bg-gradient-to-b from-[#36393F] to-[#2F3136] rounded-[52px] p-3 sm:p-4">
                    {/* Header with logo - WhatsApp style */}
                    <div className="flex items-center justify-between bg-white bg-opacity-5 px-3 py-2 rounded-t-xl mt-12 sm:mt-14 mb-4 pointer-events-none">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                          <Monitor className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-white font-semibold text-xs sm:text-sm">SOS IT Services</h2>
                          <p className="text-gray-400 text-[10px] sm:text-xs">en ligne</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Monitor className="w-5 h-5 text-gray-400" />
                        <Settings className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Chat messages - WhatsApp style */}
                    <div className="space-y-3 sm:space-y-4 pointer-events-none">
                      {messages.map((message, index) => renderMessage(message, index))}
                      {renderTypingIndicator()}
                    </div>

                    {/* Message input - WhatsApp style */}
                    <div className="absolute bottom-6 sm:bottom-8 left-3 sm:left-4 right-3 sm:right-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-white bg-opacity-5 rounded-full p-2 sm:p-3 px-3 sm:px-4 flex items-center flex-grow pointer-events-none">
                          <input type="text" placeholder="Message" className="bg-transparent text-gray-300 text-xs sm:text-sm w-full focus:outline-none cursor-default" readOnly />
                        </div>
                        <a 
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#5865F2] rounded-full p-2 sm:p-3 flex items-center justify-center hover:bg-opacity-90 transition-colors relative z-10"
                        >
                          <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </a>
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 pointer-events-none">
                      <div className="w-[100px] sm:w-[120px] md:w-[140px] h-1 bg-gray-600 rounded-full"></div>
                    </div>
                  </div>

                  {/* Side buttons with titanium look */}
                  <div className="absolute top-[80px] sm:top-[90px] md:top-[100px] -right-[3px] w-[3px] h-[35px] sm:h-[38px] md:h-[40px] bg-[#2a2a2a] rounded-l"></div>
                  <div className="absolute top-[140px] sm:top-[150px] md:top-[160px] -right-[3px] w-[3px] h-[60px] sm:h-[65px] md:h-[70px] bg-[#2a2a2a] rounded-l"></div>
                  <div className="absolute top-[80px] sm:top-[90px] md:top-[100px] -left-[3px] w-[3px] h-[30px] sm:h-[32px] md:h-[35px] bg-[#2a2a2a] rounded-r"></div>
                  
                  {/* Action button */}
                  <div className="absolute top-[160px] sm:top-[170px] md:top-[180px] -right-[5px] w-[5px] h-[35px] sm:h-[38px] md:h-[40px] bg-[#2a2a2a] rounded-l"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arguments commerciaux avec profondeur et effet 3D */}
        <div className="relative mt-12 mb-12">
          {/* Bulles décoratives */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute top-[50%] right-[30%] w-[200px] h-[200px] bg-cyan-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[40%] left-[30%] w-[250px] h-[250px] bg-orange-500/20 rounded-full blur-[90px]"></div>
          </div>
          
          {/* Points de grille subtils */}
          <div className="absolute inset-0 bg-grid-blue-500/[0.03] bg-[length:20px_20px] -z-10"></div>
          
          {/* Cercle central */}
          <div className="flex flex-col items-center justify-center text-center pb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#5865F2]/20 text-[#5865F2] mb-4">
              <BadgeCheck size={16} className="mr-1.5" />
              <span className="text-sm font-medium">Nos avantages</span>
            </div>
          </div>
          
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center items-stretch mx-auto px-4 py-2 pb-6 max-w-6xl">
             {/* Item 1 - Dépannage à distance */}
             <div className="relative h-full">
               <a 
                 href="/depannage-informatique"
                 className="block w-full h-full"
               >
                 <div className="w-full h-full transform transition-all duration-300 hover:translate-y-[-8px] cursor-pointer">
                   <div className="relative h-full bg-[#5865F2]/10 rounded-xl shadow-lg border-2 border-[#5865F2] p-6 flex flex-col items-center justify-center overflow-hidden">
                     
                     <div className="flex flex-col items-center mb-3">
                       <div className="bg-[#5865F2]/20 rounded-full p-3 flex-shrink-0 mb-4">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#5865F2]">
                           <path d="M12 3L19 7V17L12 21L5 17V7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                         </svg>
                       </div>
                       <h3 className="text-white font-medium text-base whitespace-nowrap overflow-hidden text-ellipsis text-center">Dépannage à distance</h3>
                       <div className="h-[1px] w-3/4 bg-gradient-to-r from-transparent via-[#5865F2]/40 to-transparent my-2"></div>
                       <p className="text-gray-300 text-xs text-center">Partout en France</p>
                     </div>
                   </div>
                 </div>
               </a>
             </div>
             
             {/* Item 2 - Intervention rapide */}
             <div className="relative h-full">
               <a 
                 href={whatsappUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="block w-full h-full"
               >
                 <div className="w-full h-full transform transition-all duration-300 hover:translate-y-[-8px] cursor-pointer">
                   <div className="relative h-full bg-[#5865F2]/10 rounded-xl shadow-lg border-2 border-[#5865F2] p-6 flex flex-col items-center justify-center overflow-hidden">
                     {/* Badge réponse assurée */}
                     <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                       <div className="bg-[#5865F2] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                         Réponse assurée
                       </div>
                     </div>
                     
                     <div className="flex flex-col items-center mb-3">
                       <div className="bg-[#5865F2]/20 rounded-full p-3 flex-shrink-0 mb-4">
                         <Zap className="w-6 h-6 text-[#5865F2]" />
                       </div>
                       <h3 className="text-white font-medium text-base whitespace-nowrap overflow-hidden text-ellipsis text-center">Intervention rapide</h3>
                       <div className="h-[1px] w-3/4 bg-gradient-to-r from-transparent via-[#5865F2]/40 to-transparent my-2"></div>
                       <p className="text-gray-300 text-xs text-center">Prenez rendez-vous en ligne</p>
                     </div>
                   </div>
                 </div>
               </a>
             </div>
             
             {/* Item 3 - Satisfait ou remboursé */}
             <div className="relative h-full">
               <div className="w-full h-full transform transition-all duration-300 hover:translate-y-[-8px] cursor-pointer">
                 <div className="relative h-full bg-[#5865F2]/10 rounded-xl shadow-lg border-2 border-[#5865F2] p-6 flex flex-col items-center justify-center overflow-hidden">
                   <div className="flex flex-col items-center mb-3">
                     <div className="bg-[#5865F2]/20 rounded-full p-3 flex-shrink-0 mb-4">
                       <CreditCard className="w-6 h-6 text-[#5865F2]" />
                     </div>
                     <h3 className="text-white font-medium text-base whitespace-nowrap overflow-hidden text-ellipsis text-center">Satisfait ou remboursé</h3>
                     <div className="h-[1px] w-3/4 bg-gradient-to-r from-transparent via-[#5865F2]/40 to-transparent my-2"></div>
                     <p className="text-gray-300 text-xs text-center">Débité seulement si résolu</p>
                   </div>
                 </div>
               </div>
             </div>
             
             {/* Item 4 - Crédit d'impôt */}
             <div className="relative h-full">
               <div className="w-full h-full transform transition-all duration-300 hover:translate-y-[-8px] cursor-pointer">
                 <div className="relative h-full bg-[#5865F2]/10 rounded-xl shadow-lg border-2 border-[#5865F2] p-6 flex flex-col items-center justify-center overflow-hidden">
                   
                   <div className="flex flex-col items-center mb-3">
                     <div className="bg-[#5865F2]/20 rounded-full p-3 flex-shrink-0 mb-4">
                       <Percent className="w-6 h-6 text-[#5865F2]" />
                     </div>
                     <h3 className="text-white font-medium text-base whitespace-nowrap overflow-hidden text-ellipsis text-center">Crédit d'impôt 50%</h3>
                     <div className="h-[1px] w-3/4 bg-gradient-to-r from-transparent via-[#5865F2]/40 to-transparent my-2"></div>
                     <p className="text-gray-300 text-xs text-center">Sous réserve d'éligibilité</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
          
          {/* Bouton pour en savoir plus */}
          <div className="flex justify-center w-full mt-10 gap-4">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-6 py-3 bg-[#5865F2] backdrop-blur-xl rounded-full border border-[#5865F2]/30 text-white hover:bg-[#5865F2]/80 transition-all flex items-center space-x-2 group overflow-hidden hover:scale-105 hover:shadow-lg hover:shadow-[#5865F2]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
              <span className="relative z-10">Je veux être dépanné</span>
              <Zap size={16} className="relative z-10 ml-2" />
            </a>
            <a 
              href="/depannage-informatique" 
              className="relative px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/30 text-white hover:bg-white/15 transition-all flex items-center space-x-2 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
              <span className="relative z-10">Découvrir tous nos services</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;