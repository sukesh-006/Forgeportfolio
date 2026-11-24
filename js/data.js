/*
 * All site content lives here. Edit text, add or remove items — the page updates itself.
 * Only claim what is true: when a project is delivered for a real client, change its
 * badge to 'Live client' and add `live: 'https://…'`.
 */
window.FORGE_DATA = {
  rotating: ['hospitals', 'hotels', 'gyms', 'boutiques', 'salons', 'clinics', 'restaurants'],

  services: [
    {
      title: 'Business websites',
      text: 'A fast, good-looking website for businesses with no online presence yet — so customers find you on Google and trust you before they call.',
      points: ['Mobile-first design', 'Google Maps & WhatsApp button', 'Photo gallery & price lists', 'Basic SEO'],
      icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3.2 3.2 14.8 0 18M12 3c-3.2 3.2-3.2 14.8 0 18"/>',
    },
    {
      title: 'Booking & reservation systems',
      text: 'Let customers book rooms, appointments, classes or tables online — with live availability, so you stop juggling phone calls and notebooks.',
      points: ['Live availability calendar', 'Online payment (UPI / card)', 'Confirmations & reminders', 'No double bookings'],
      icon: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    },
    {
      title: 'Management dashboards',
      text: 'One private admin panel to run the business: customers, staff, billing and reports — all in one place instead of five Excel sheets.',
      points: ['Staff logins & roles', 'Billing & invoices', 'Daily / monthly reports', 'Works on phone & laptop'],
      icon: '<rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="15" width="8" height="6" rx="1.5"/>',
    },
    {
      title: 'Online stores',
      text: 'Sell your products online: catalogue, cart, payments and order tracking. Ideal for boutiques and local shops that sell through Instagram and WhatsApp today.',
      points: ['Product catalogue & stock', 'UPI / card payments', 'Order status for customers', 'Discount codes'],
      icon: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
    },
    {
      title: 'AI chatbots & automation',
      text: 'An assistant on your website or WhatsApp that answers common questions, takes bookings and sends reminders — even when you are asleep.',
      points: ['Answers FAQs instantly', 'Books & reminds', 'Learns from your own documents', 'You stay in control'],
      icon: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/>',
    },
    {
      title: 'Hosting, domain & support',
      text: 'I take care of the technical parts: domain, hosting, security and backups. After launch I fix issues and add features as your business grows.',
      points: ['Domain & SSL set up', 'Secure hosting', 'Backups & monitoring', 'Fixes after launch'],
      icon: '<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/>',
    },
  ],

  projects: [
    {
      id: 'hospital',
      title: 'MediCare Desk',
      kind: 'Hospital & clinic management',
      badge: 'Made-to-order',
      motif: 'hospital',
      summary: 'Appointments, doctors and patient records on one screen — no more paper registers and phone-call chaos at the front desk.',
      who: 'Clinics, small hospitals, dental practices, diagnostic labs',
      features: [
        'Online appointment booking with doctor-wise time slots',
        'Patient records and visit history',
        'Billing, invoices and payment tracking',
        'SMS / WhatsApp appointment reminders',
        'Separate logins for doctors, reception and admin',
        'Daily and monthly reports',
      ],
      stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Docker'],
    },
    {
      id: 'hotel',
      title: 'StayDesk',
      kind: 'Hotel & room booking',
      badge: 'Made-to-order',
      motif: 'hotel',
      summary: 'Show your rooms, take bookings directly and see who checks in today. Keep more of every booking instead of paying commission.',
      who: 'Small hotels, lodges, homestays, guest houses, resorts',
      features: [
        'Room types, photos and live availability calendar',
        'Online booking with advance payment (UPI / card)',
        'Check-in / check-out and housekeeping status',
        'Invoices and receipts',
        'Seasonal and weekend pricing',
        'Booking reports for the owner',
      ],
      stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Payments API'],
    },
    {
      id: 'gym',
      title: 'IronPulse',
      kind: 'Gym & fitness management',
      badge: 'Made-to-order',
      motif: 'gym',
      summary: 'Memberships, renewals and attendance without the notebook. Members get reminders, you get your fees on time.',
      who: 'Gyms, yoga studios, fitness centres, sports academies',
      features: [
        'Member profiles, plans and joining forms',
        'Automatic fee-due reminders',
        'QR-code check-in and attendance',
        'Trainer and class schedules',
        'Online renewals and payments',
        'Revenue and attendance reports',
      ],
      stack: ['React', 'FastAPI', 'PostgreSQL', 'QR check-in'],
    },
    {
      id: 'boutique',
      title: 'Boutique Studio',
      kind: 'Boutique & fashion store',
      badge: 'Made-to-order',
      motif: 'boutique',
      summary: 'Put your collection online, take orders from the website and WhatsApp, and track every stitching order from start to delivery.',
      who: 'Boutiques, tailors, ethnic-wear shops, jewellery and gift stores',
      features: [
        'Catalogue with sizes, colours and stock',
        'Orders from website and WhatsApp in one place',
        'Customer measurements and tailoring-order tracking',
        'UPI / card payments',
        'Order status updates to customers',
        'Festival sales and discount codes',
      ],
      stack: ['Next.js', 'FastAPI', 'MongoDB', 'Payments API'],
    },
    {
      id: 'ekip',
      title: 'EKIP',
      kind: 'Knowledge platform · my own build',
      badge: 'Deployed',
      motif: 'ekip',
      summary: 'A production-style knowledge platform I built and deployed myself: a 10-node multi-agent AI pipeline running on Kubernetes. The same engineering care goes into every business system above.',
      who: 'Proof of what I can build end to end',
      features: [
        '10-node multi-agent pipeline',
        'Deployed on Kubernetes',
        'Built and shipped end to end by me',
      ],
      stack: ['Kubernetes', 'Docker', 'Multi-agent AI'],
    },
  ],

  more: ['Salon & spa', 'Restaurant & café', 'Tuition centre', 'Pharmacy', 'Repair shop', 'Real estate', 'Event planner', 'Travel agency'],

  businessTypes: [
    'Hospital / clinic',
    'Hotel / stay',
    'Gym / fitness',
    'Boutique / fashion store',
    'Salon / spa',
    'Restaurant / café',
    'Other',
  ],

  stack: ['Python', 'FastAPI', 'Next.js', 'React', 'PostgreSQL', 'MongoDB', 'Qdrant', 'Docker', 'Kubernetes', 'CI/CD', 'Grafana', 'LLM agents'],

  process: [
    { title: 'Talk', text: 'You tell me how your business runs today — bookings, customers, payments. I ask questions and suggest what to build first.' },
    { title: 'Design', text: 'I show you the screens before I write the code, so you see exactly what you are getting and can change it early.' },
    { title: 'Build', text: 'I build in small steps and show you progress as we go. You test it on your own phone, not in a meeting.' },
    { title: 'Launch', text: 'I set up the domain and hosting, show you and your staff how to use it, and stay around for fixes after launch.' },
  ],

  stats: [
    { value: '2', label: 'Internships — web development and ServiceNow ITSM' },
    { value: '10', label: 'Nodes in the multi-agent AI pipeline I shipped on Kubernetes' },
    { value: '1', label: 'Person you talk to — me, from first call to launch' },
  ],
};
