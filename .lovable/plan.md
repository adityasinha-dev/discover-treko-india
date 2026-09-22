# Explore Destinations Page

## Goal
Create a polished `/explore` directory that follows Treko’s existing visual system and supports the journey: explore India → choose a destination → discover stays and local cab operators.

## Implementation

### Shared navigation and footer
- Extract the existing Treko navbar, logo, and footer into shared components so `/` and `/explore` use the same design and behavior.
- Make the logo navigate to `/` and “Explore Destinations” navigate to `/explore` on desktop and mobile.
- Update appropriate landing-page CTAs—including Start Exploring, Explore Destination(s), and the new hero “Get Started” button—to navigate to `/explore`.
- Preserve section links for Stays, Cab Operators, How It Works, Become a Partner, and About by linking them back to their landing-page sections.

### Destination data
- Expand the mock data into a reusable typed destination directory with `name`, `slug`, `state`, `image`, `description`, `type`, `featured`, `dateAdded`, `servicesAvailable`, `accommodationCount`, and `cabOperatorCount`.
- Include a manageable India-only set such as Ujjain, Jaipur, Agra, Varanasi, Manali, Shimla, Rishikesh, Goa, Amritsar, Ayodhya, Haridwar, and Nainital.
- Clearly label all counts as demonstration data and avoid representing listings as verified businesses.

### Explore page
- Add `/explore` with unique page title, description, Open Graph metadata, and the shared navbar/footer.
- Build a compact “Explore India” header with supporting copy, a working destination search, and a clear India-focused visual treatment.
- Add a non-repetitive featured row for 4–6 popular destinations, followed by the complete “Explore More Destinations” directory.
- Build reusable `ExploreHero`, `DestinationSearch`, `DestinationFilters`, `FeaturedDestinations`, `DestinationGrid`, and `DestinationCard` components.
- Keep cards visually consistent with Treko: destination imagery, state, description, stay/cab counts, restrained elevation, image zoom, and animated CTA movement.

### Search, filters, and sorting
- Filter destinations immediately by name, state, description, or type.
- Add working State, Destination Type, Services Available, and Sort By controls.
- Support Popular, A–Z, and Recently Added ordering.
- Combine all active controls correctly and provide a reset action.
- Show a polished empty state when no destination matches.

### Destination navigation foundation
- Make each card navigate with typed route parameters to `/destinations/{destination-slug}`.
- Add a reusable dynamic `/destinations/$slug` placeholder page for this phase, with the chosen destination name, a concise “details coming next” state, and links back to `/explore` and `/`.
- Provide a safe not-found state for unknown slugs without building accommodation or cab-detail listings yet.

### Responsive behavior and verification
- Use four/three/two/one-column layouts as space allows, with mobile-friendly stacked search and filter controls and no horizontal scrolling.
- Preserve keyboard focus states, semantic labels, reduced-motion behavior, and responsive navigation.
- Verify landing-page navigation, search/filter combinations, empty state, destination links, placeholder routes, and desktop/mobile rendering in the live preview.

## Scope boundary
Frontend and mock data only. No accounts, backend storage, booking, payments, reviews, or external accommodation/cab APIs.
