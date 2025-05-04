import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItem> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 last:border-0">
      <button
        className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-white">{question}</h3>
        {isOpen ? (
          <ChevronUp className="text-[#5865F2] h-5 w-5 flex-shrink-0" />
        ) : (
          <ChevronDown className="text-[#5865F2] h-5 w-5 flex-shrink-0" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-300">{answer}</p>
      </div>
    </div>
  );
};

const Faq: React.FC = () => {
  const faqItems: FaqItem[] = [
    {
      question: 'How long does a typical computer repair take?',
      answer: 'Most basic repairs can be completed within 24-48 hours. More complex issues might take 3-5 business days. We always provide a time estimate before beginning any work.'
    },
    {
      question: 'Do you offer an on-site repair service?',
      answer: 'Yes, we offer on-site services for businesses and residential customers within a 25-mile radius. Additional travel fees may apply for locations outside this area.'
    },
    {
      question: 'Can you recover data from a failing hard drive?',
      answer: 'In many cases, yes. Our success rate for data recovery is over 90% for drives that haven\'t suffered physical damage. For physically damaged drives, we partner with specialized recovery services.'
    },
    {
      question: 'Do you offer any warranty on your repairs?',
      answer: 'All our repairs come with a 90-day warranty covering both parts and labor. Extended warranties are available for purchase on select services.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, Apple Pay, Google Pay, and cash. For business clients, we also offer net-30 terms with approved credit.'
    },
    {
      question: 'Do I need an appointment for repair services?',
      answer: 'Walk-ins are welcome for quick diagnostics and minor repairs. For more complex issues, we recommend scheduling an appointment to ensure minimal wait time.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-[#2F3136]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-300">
            Find answers to our most commonly asked questions. If you don't see what you're looking for, 
            feel free to contact us directly.
          </p>
        </div>
        
        <div className="bg-[#36393F] rounded-lg overflow-hidden shadow-lg">
          <div className="p-6 space-y-0">
            {faqItems.map((item, index) => (
              <FaqItem 
                key={index} 
                question={item.question} 
                answer={item.answer} 
              />
            ))}
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-gray-300">
            Still have questions? Contact our support team at{' '}
            <a href="mailto:support@techfix.com" className="text-[#5865F2] hover:underline">
              support@techfix.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Faq;