import Hero from '../components/Hero';
import Pricing from '../components/Pricing';
import Team from '../components/Team';
import Faq from '../components/Faq';
import TrustpilotWidget from '../components/TrustpilotWidget';
import { Chatbot } from "../components/Chatbot";


const HomePage = () => (
  <>
    <Hero />
    <div className="section-divider"></div>
    <TrustpilotWidget />
    <Pricing />
    <div className="section-divider"></div>
    <Team />
    <div className="section-divider"></div>
    <Faq />
    <Chatbot />

  </>
);

export default HomePage; 