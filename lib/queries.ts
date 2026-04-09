export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]`

export const NAVIGATION_QUERY = `*[_type == "navigation"][0]{
  brandName,
  logo,
  menuItems[]{
    label,
    sectionId,
    order,
    isVisible
  },
  ctaButton{
    text,
    link
  },
  backgroundColor,
  textColor,
  activeLinkColor
}`

export const HERO_QUERY = `*[_type == "hero"][0]{
  title,
  ctaText,
  ctaLink,
  heroImage,
  heroBackgroundImage,
  backgroundColor,
  headingColor,
  textColor,
  buttonColor,
  buttonTextColor,
  richTitle,
  richSubtitle
}`

export const ABOUT_QUERY = `*[_type == "about"][0]{
  heading,
  mission,
  mentorName,
  mentorDescription,
  profileImage,
  mentorImage,
  quoteIcon,
  highlightQuote,
  quoteText,
  quoteAccentColor,
  quoteTextColor,
  secondaryDescription,
  ctaText,
  ctaLink,
  backgroundColor,
  cardBackgroundColor,
  headingColor,
  textColor,
  credentials
}`

export const SERVICES_SECTION_QUERY = `*[_type == "servicesSection"][0]{
  title,
  subtitle,
  backgroundColor,
  headingColor,
  textColor
}`

export const SERVICES_QUERY = `*[_type == "service"]{
  _id,
  title,
  description,
  targetAudience,
  icon
}`

export const MENTORIA_QUERY = `*[_type == "mentoria"][0] {
  ...,
  methodologyContent,
  steps[] -> {
    _id,
    stepNumber,
    stepTitle,
    stepDescription,
    badgeBackgroundColor,
    badgeTextColor
  }
}`

export const PRICING_SECTION_QUERY = `*[_type == "pricingSection"][0]{
  sectionTitle,
  sectionSubtitle,
  backgroundColor,
  headingColor,
  textColor
}`

export const PRICING_QUERY = `*[_type == "pricingPlan"] | order(order asc){
  _id,
  order,
  category,
  planName,
  price,
  shortDescription,
  planIcon,
  benefits,
  ctaText,
  ctaLink,
  isHighlighted,
  recommendedBadgeIcon,
  backgroundColor,
  headingColor,
  textColor
}`

export const TESTIMONIALS_SECTION_QUERY = `*[_type == "testimonialsSection"][0]{
  sectionTitle,
  sectionSubtitle,
  backgroundColor,
  headingColor,
  textColor
}`

export const TESTIMONIALS_QUERY = `*[_type == "testimonial"]{
  _id,
  name,
  role,
  message,
  avatarImage,
  organizationLogo,
  cardBackgroundColor,
  headingColor,
  textColor
}`

export const BLOG_SECTION_QUERY = `*[_type == "blogSection"][0]{
  sectionTitle,
  sectionSubtitle,
  backgroundColor,
  headingColor,
  textColor,
  cardBackgroundColor,
  cardHeadingColor,
  cardTextColor,
  articles[]-> {
    _id,
    title,
    slug,
    excerpt,
    author,
    publishDate,
    thumbnail,
    content
  }
}`

export const COURSE_BLOG_QUERY = `*[_type == "courseBlog"][0]{
  sectionTitle,
  entries[]{
    title,
    image,
    content
  }
}`

export const BLOG_POST_QUERY = `*[_type == "blogPost" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  excerpt,
  author,
  publishDate,
  thumbnail,
  content
}`

export const CONTACT_INFO_QUERY = `*[_type == "contactInfo"][0]{
  email,
  phone,
  address,
  backgroundColor,
  headingColor,
  textColor,
  formTitle,
  formSubtitle,
  nameLabel,
  emailLabel,
  messageLabel,
  submitButtonText,
  successMessage
}`

export const CONTACT_SECTION_QUERY = `*[_type == "contactSection"][0]{
  sectionTitle,
  sectionSubtitle,
  backgroundColor,
  headingColor,
  textColor,
  cardBackgroundColor,
  buttonColor,
  buttonTextColor,
  inputBackgroundColor,
  inputTextColor,
  inputBorderColor,
  email,
  phone,
  address,
  emailIcon,
  phoneIcon,
  locationIcon,
  illustrationImage,
  formTitle,
  namePlaceholder,
  emailPlaceholder,
  phonePlaceholder,
  purposeOptions,
  messagePlaceholder,
  submitButtonText
}`

export const FOOTER_QUERY = `*[_type == "footer"][0]{
  logo,
  brandName,
  description,
  socialLinks[]{
    platform,
    url,
    icon
  },
  quickLinks[]{
    label,
    sectionId
  },
  email,
  phone,
  address,
  copyrightText,
  madeByText,
  backgroundColor,
  headingColor,
  textColor,
  linkColor,
  accentColor
}`

export const FULL_WEBSITE_DOCUMENT_QUERY = `*[_type == "fullWebsiteDocument"][0]{
  title,
  content
}`
