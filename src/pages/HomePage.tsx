import Hero from '../components/Hero';
import Pricing from '../components/Pricing';
import Team from '../components/Team';
import Faq from '../components/Faq';
import TrustpilotWidget from '../components/TrustpilotWidget';

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
  </>
);

export default HomePage; 