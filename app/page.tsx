import Hero from '@/components/Hero'
import AboutSection from '@/components/About'
import ServicesSection from '@/components/ServicesSection'
import TestimonialCard from '@/components/TestimonialCard'
import BlogSection from '@/components/BlogSection'
import ContactSection from '@/components/ContactSection'
import MethodologySection from '@/components/MethodologySection'
import { fetchSanityData } from '@/lib/sanity'
import {
  HERO_QUERY,
  ABOUT_QUERY,
  SERVICES_SECTION_QUERY,
  SERVICES_QUERY,
  PRICING_QUERY,
  TESTIMONIALS_SECTION_QUERY,
  TESTIMONIALS_QUERY,
  BLOG_SECTION_QUERY,
  CONTACT_SECTION_QUERY
} from '@/lib/queries'
import { METHODOLOGY_SECTION_QUERY } from '@/lib/methodologyQueries'

export default async function Home() {
  const results = await Promise.allSettled([
    fetchSanityData(HERO_QUERY),
    fetchSanityData(METHODOLOGY_SECTION_QUERY),
    fetchSanityData(SERVICES_SECTION_QUERY),
    fetchSanityData(SERVICES_QUERY),
    fetchSanityData(PRICING_QUERY),
    fetchSanityData(ABOUT_QUERY),
    fetchSanityData(TESTIMONIALS_SECTION_QUERY),
    fetchSanityData(TESTIMONIALS_QUERY),
    fetchSanityData(BLOG_SECTION_QUERY),
    fetchSanityData(CONTACT_SECTION_QUERY)
  ])

  const [
    heroSection,
    methodologySection,
    servicesSection,
    services,
    pricingPlans,
    aboutSection,
    testimonialsSection,
    testimonials,
    blogSection,
    contactSection
  ] = results.map((result) => (result.status === 'fulfilled' ? result.value : null))

  return (
    <>
      {/* Home Content */}
      <Hero section={heroSection} />

      {/* Mentoria Journey */}
      {methodologySection ? <MethodologySection section={methodologySection} /> : null}

      {/* Services Section */}
      {servicesSection ? <ServicesSection section={servicesSection} services={services} packages={pricingPlans} /> : null}

      {/* Meet the Mentor */}
      {aboutSection ? <AboutSection section={aboutSection} /> : null}

      {/* Testimonials */}
      <section
        id="testimonials"
        style={{ backgroundColor: testimonialsSection?.backgroundColor || '#ffffff' }}
        className="px-6 py-16"
      >
        <div className="mx-auto max-w-7xl">
          {testimonialsSection ? (
            <>
              <div className="mb-12 text-center">
                {testimonialsSection.sectionTitle && (
                  <h2
                    style={{ color: testimonialsSection.headingColor || '#111827' }}
                    className="mb-4 text-4xl font-bold md:text-5xl"
                  >
                    {testimonialsSection.sectionTitle}
                  </h2>
                )}
                {testimonialsSection.sectionSubtitle && (
                  <p
                    style={{ color: testimonialsSection.textColor || '#374151' }}
                    className="mx-auto max-w-2xl text-lg leading-relaxed"
                  >
                    {testimonialsSection.sectionSubtitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonials && testimonials.length > 0 ? (
                  testimonials.map((testimonial: any) => (
                    <TestimonialCard
                      key={testimonial._id}
                      testimonial={testimonial}
                      sectionHeadingColor={testimonialsSection.headingColor}
                      sectionTextColor={testimonialsSection.textColor}
                    />
                  ))
                ) : (
                  <p
                    style={{ color: testimonialsSection.textColor || '#374151' }}
                    className="col-span-full text-center"
                  >
                    No testimonials available.
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Courses & Blog */}
      <BlogSection section={blogSection} />

      {/* Contact Section */}
      {contactSection && <ContactSection section={contactSection} />}
    </>
  )
}
