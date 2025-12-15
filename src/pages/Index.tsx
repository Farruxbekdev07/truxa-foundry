import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { RoleCards } from '@/components/landing/RoleCards';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <section id="features">
          <Features />
        </section>
        <section id="roles">
          <RoleCards />
        </section>
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
