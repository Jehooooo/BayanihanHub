import { Link, Navigate } from 'react-router-dom';
import {
  Heart,
  ArrowRight,
  Users,
  Repeat,
  Sparkles,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/common/ScrollReveal';
import { useAuthStore } from '@/stores/authStore';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-neutral-50)' }}>
      <Header />

      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '3rem', paddingBottom: '3.25rem', background: 'linear-gradient(to bottom, rgba(232,245,233,0.6), #ffffff, var(--color-neutral-50))', borderBottom: '1px solid var(--color-neutral-200)' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2.5rem', alignItems: 'center' }}>
            {/* Hero Text Content */}
            <div style={{ gridColumn: 'span 7 / span 7', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <ScrollReveal direction="down" delay={40}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.8rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-800)', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
                  <Sparkles style={{ width: '0.95rem', height: '0.95rem', color: 'var(--color-primary-600)' }} />
                  Community Exchange & Donation Platform
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={80}>
                <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.15, letterSpacing: '-0.025em', margin: 0 }}>
                  Stronger Together. <br />
                  <span style={{ color: 'var(--color-primary-600)' }}>Share. Care. Inspire.</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={120}>
                <p style={{ fontSize: '1.05rem', color: 'var(--color-neutral-600)', maxWidth: '36rem', lineHeight: '1.55', margin: 0 }}>
                  Bayanihan Hub connects neighbors to donate unused items, fulfill urgent needs, and exchange goods safely. Build a sustainable community in your barangay today.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={160}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', paddingTop: '0.25rem' }}>
                  <Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/register'} style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="lg" className="font-bold px-7 shadow-button" rightIcon={<ArrowRight style={{ width: '1.15rem', height: '1.15rem' }} />}>
                      {isAuthenticated ? 'Go to Dashboard' : 'Join the Community'}
                    </Button>
                  </Link>
                  <Link to="/browse" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="lg" className="font-semibold px-6">
                      Browse Available Items
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>

              {/* Key Features Badges Row */}
              <ScrollReveal direction="up" delay={200}>
                <div style={{ paddingTop: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)' }} /> 100% Free Sharing
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)' }} /> Verified Neighbors
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)' }} /> Safe Local Pickups
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Visual Demo Card */}
            <div style={{ gridColumn: 'span 5 / span 5', position: 'relative' }}>
              <ScrollReveal direction="scale" delay={150}>
                <div style={{ margin: '0 auto', maxWidth: '26rem', backgroundColor: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-elevated)', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-600)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>
                        MS
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Maria Santos</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 500, margin: 0 }}>Aringay, La Union • 0.8 km</p>
                      </div>
                    </div>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
                      Donation
                    </span>
                  </div>

                  <div style={{ height: '12rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-neutral-100)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-neutral-200)', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '0.875rem', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.625rem' }}>
                      <BookOpen style={{ width: '1.75rem', height: '1.75rem', color: 'var(--color-primary-600)' }} />
                    </div>
                    <h3 style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.9375rem', margin: 0 }}>Grade 10 Textbooks & Uniform</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem', lineHeight: '1.45', maxWidth: '18rem', margin: '0.25rem 0 0 0' }}>
                      Donating a complete set of high school books and uniforms to a student in need.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-neutral-500)', paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                      <Heart style={{ width: '1rem', height: '1rem', fill: 'var(--color-danger)' }} /> 28 favorites
                    </span>
                    <span>Posted 2h ago</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ padding: '2rem 0', backgroundColor: 'var(--color-primary-700)', color: '#fff' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
            <ScrollReveal direction="up" delay={50}>
              <div style={{ padding: '0 0.75rem' }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>1,240+</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary-100)', fontWeight: 500, marginTop: '0.2rem' }}>Active Neighbors</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={120}>
              <div style={{ padding: '0 0.75rem', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>890+</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary-100)', fontWeight: 500, marginTop: '0.2rem' }}>Items Donated</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={190}>
              <div style={{ padding: '0 0.75rem', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>630+</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary-100)', fontWeight: 500, marginTop: '0.2rem' }}>Exchanges Done</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={260}>
              <div style={{ padding: '0 0.75rem', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>99%</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary-100)', fontWeight: 500, marginTop: '0.2rem' }}>Community Trust</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '3.25rem 0' }}>
        <div className="page-container">
          <ScrollReveal direction="up" delay={60}>
            <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 2.5rem auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-neutral-900)', letterSpacing: '-0.025em', margin: 0 }}>How Bayanihan Hub Helps</h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-neutral-600)', lineHeight: '1.55', margin: 0 }}>
                Empowering barangays through zero-waste item sharing, emergency community requests, and fair bartering.
              </p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <ScrollReveal direction="up" delay={80}>
              <div style={{ backgroundColor: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <Heart style={{ width: '1.35rem', height: '1.35rem' }} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.375rem' }}>Item Donations</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: '1.55', margin: 0 }}>
                    Give away surplus household goods, clothes, textbooks, or appliances directly to individuals in your local neighborhood who need them.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={160}>
              <div style={{ backgroundColor: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <Repeat style={{ width: '1.35rem', height: '1.35rem' }} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.375rem' }}>Item Exchange</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: '1.55', margin: 0 }}>
                    Trade goods you no longer use for something useful. Propose fair swaps with interactive item-to-item offer matching.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={240}>
              <div style={{ backgroundColor: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <Users style={{ width: '1.35rem', height: '1.35rem' }} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.375rem' }}>Community Requests</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: '1.55', margin: 0 }}>
                    Need urgent school supplies, medical goods, or tools? Post a request and get matched with generous donors nearby.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section style={{ padding: '3.25rem 0', backgroundColor: 'rgba(241,245,243,0.7)', borderTop: '1px solid var(--color-neutral-200)', borderBottom: '1px solid var(--color-neutral-200)' }}>
        <div className="page-container">
          <ScrollReveal direction="up" delay={60}>
            <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 2.5rem auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-neutral-900)', letterSpacing: '-0.025em', margin: 0 }}>How It Works</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', margin: 0 }}>Start sharing in 3 easy steps</p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
            <ScrollReveal direction="up" delay={80}>
              <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '0.875rem', height: '100%' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-600)', color: '#fff', fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  1
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Create an Account</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', maxWidth: '18rem', margin: '0 auto', lineHeight: '1.55' }}>
                  Sign up with your barangay location to connect directly with neighbors around you.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={160}>
              <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '0.875rem', height: '100%' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-600)', color: '#fff', fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  2
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Post or Browse Items</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', maxWidth: '18rem', margin: '0 auto', lineHeight: '1.55' }}>
                  Upload photos of items you want to give/exchange, or search active listings nearby.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={240}>
              <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '0.875rem', height: '100%' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-600)', color: '#fff', fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  3
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Connect & Exchange</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', maxWidth: '18rem', margin: '0 auto', lineHeight: '1.55' }}>
                  Chat securely, arrange meeting details, and complete the exchange with trust ratings.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '3.25rem 0', backgroundColor: 'var(--color-primary-600)', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
          <ScrollReveal direction="scale" delay={60}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>Ready to make a difference in your community?</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={120}>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-primary-100)', lineHeight: '1.55', margin: 0 }}>
              Join thousands of neighbors fostering sustainability, trust, and mutual aid across the Philippines.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={180}>
            <div style={{ paddingTop: '0.25rem' }}>
              <Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/register'} style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg" className="font-bold px-7 shadow-button">
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'}
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

