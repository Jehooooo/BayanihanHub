import { Link } from 'react-router-dom';
import {
  Heart,
  ArrowRight,
  Users,
  Repeat,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-neutral-50)' }}>
      <Header />

      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '4rem', paddingBottom: '5rem', background: 'linear-gradient(to bottom, rgba(232,245,233,0.6), #ffffff, var(--color-neutral-50))', borderBottom: '1px solid var(--color-neutral-200)' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3rem', alignItems: 'center' }}>
            {/* Hero Text Content */}
            <div style={{ gridColumn: 'span 7 / span 7', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-800)', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
                <Sparkles style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)' }} />
                Community Exchange & Donation Platform
              </div>

              <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.15, letterSpacing: '-0.025em', margin: 0 }}>
                Stronger Together. <br />
                <span style={{ color: 'var(--color-primary-600)' }}>Share. Care. Inspire.</span>
              </h1>

              <p style={{ fontSize: '1.125rem', color: 'var(--color-neutral-600)', maxWidth: '36rem', lineHeight: '1.6', margin: 0 }}>
                Bayanihan Hub connects neighbors to donate unused items, fulfill urgent needs, and exchange goods safely. Build a sustainable community in your barangay today.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem' }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg" className="font-bold px-8 shadow-button" rightIcon={<ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />}>
                    Join the Community
                  </Button>
                </Link>
                <Link to="/browse" style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="lg" className="font-semibold px-6">
                    Browse Available Items
                  </Button>
                </Link>
              </div>

              {/* Key Features Badges Row */}
              <div style={{ paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
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
            </div>

            {/* Visual Demo Card */}
            <div style={{ gridColumn: 'span 5 / span 5', position: 'relative' }}>
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

                <div style={{ height: '13rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-neutral-100)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-neutral-200)', padding: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📚</span>
                  <h3 style={{ fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '1rem', margin: 0 }}>Grade 10 Textbooks & Uniform</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem', lineHeight: '1.5', maxWidth: '18rem', margin: '0.25rem 0 0 0' }}>
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
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ padding: '3rem 0', backgroundColor: 'var(--color-primary-700)', color: '#fff' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            <div style={{ padding: '0 1rem' }}>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>1,240+</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-100)', fontWeight: 500, marginTop: '0.25rem' }}>Active Neighbors</p>
            </div>
            <div style={{ padding: '0 1rem', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>890+</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-100)', fontWeight: 500, marginTop: '0.25rem' }}>Items Donated</p>
            </div>
            <div style={{ padding: '0 1rem', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>630+</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-100)', fontWeight: 500, marginTop: '0.25rem' }}>Exchanges Done</p>
            </div>
            <div style={{ padding: '0 1rem', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>99%</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-100)', fontWeight: 500, marginTop: '0.25rem' }}>Community Trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '5rem 0' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 4rem auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-neutral-900)', letterSpacing: '-0.025em', margin: 0 }}>How Bayanihan Hub Helps</h2>
            <p style={{ fontSize: '1rem', color: 'var(--color-neutral-600)', lineHeight: '1.6', margin: 0 }}>
              Empowering barangays through zero-waste item sharing, emergency community requests, and fair bartering.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Heart style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.5rem' }}>Item Donations</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: '1.6', margin: 0 }}>
                  Give away surplus household goods, clothes, textbooks, or appliances directly to individuals in your local neighborhood who need them.
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Repeat style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.5rem' }}>Item Exchange</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: '1.6', margin: 0 }}>
                  Trade goods you no longer use for something useful. Propose fair swaps with interactive item-to-item offer matching.
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Users style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.5rem' }}>Community Requests</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: '1.6', margin: 0 }}>
                  Need urgent school supplies, medical goods, or tools? Post a request and get matched with generous donors nearby.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section style={{ padding: '5rem 0', backgroundColor: 'rgba(241,245,243,0.7)', borderTop: '1px solid var(--color-neutral-200)', borderBottom: '1px solid var(--color-neutral-200)' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 4rem auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-neutral-900)', letterSpacing: '-0.025em', margin: 0 }}>How It Works</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', margin: 0 }}>Start sharing in 3 easy steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-600)', color: '#fff', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Create an Account</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', maxWidth: '18rem', margin: '0 auto', lineHeight: '1.6' }}>
                Sign up with your barangay location to connect directly with neighbors around you.
              </p>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-600)', color: '#fff', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Post or Browse Items</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', maxWidth: '18rem', margin: '0 auto', lineHeight: '1.6' }}>
                Upload photos of items you want to give/exchange, or search active listings nearby.
              </p>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', backgroundColor: 'var(--color-primary-600)', color: '#fff', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Connect & Exchange</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', maxWidth: '18rem', margin: '0 auto', lineHeight: '1.6' }}>
                Chat securely, arrange meeting details, and complete the exchange with trust ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-primary-600)', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>Ready to make a difference in your community?</h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-primary-100)', lineHeight: '1.6', margin: 0 }}>
            Join thousands of neighbors fostering sustainability, trust, and mutual aid across the Philippines.
          </p>
          <div style={{ paddingTop: '0.5rem' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="lg" className="font-bold px-8 shadow-button">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

