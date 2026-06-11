import CTASection from '../components/CTASection';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import WorkflowSection from '../components/WorkflowSection';
import useLenis from '../hooks/useLenis';
import '../styles/landing.css';

const LandingPage = () => {
  useLenis();

  return (
    <div className="landing-page-scope">
      <Hero />
      <FeatureSection />
      <WorkflowSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
