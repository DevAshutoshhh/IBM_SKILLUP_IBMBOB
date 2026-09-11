import { EMPTY_PROFILE } from '../utils/storage';
import { ALL_INDIA, type Opportunity, type StudentProfile } from '../types';

/** A profile builder so each test states only what it actually cares about. */
export function profile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return { ...EMPTY_PROFILE, ...overrides };
}

/**
 * A synthetic opportunity used for boundary tests. The demonstration dataset
 * cannot express every extreme (nothing in it restricts location *and*
 * category at once), so score floors and ceilings are tested against a
 * purpose-built fixture instead.
 */
export function opportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'fixture-opportunity',
    name: { en: 'Fixture Opportunity', hi: 'नमूना अवसर' },
    provider: { en: 'Fixture provider', hi: 'नमूना प्रदाता' },
    description: { en: 'A synthetic entry used only by the test suite.', hi: 'केवल परीक्षण के लिए बनाई गई प्रविष्टि।' },
    category: 'merit',
    supportTypes: ['tuition'],
    educationLevels: ['undergraduate'],
    locations: [ALL_INDIA],
    income: { maxAnnualIncome: null, label: { en: 'No limit', hi: 'कोई सीमा नहीं' } },
    specialConditions: [],
    marks: { minPercentage: null, label: { en: 'No cut-off', hi: 'कोई कट-ऑफ़ नहीं' } },
    requiredDocuments: ['identity_proof'],
    optionalDocuments: [],
    applicationSteps: [{ en: 'Apply on the portal.', hi: 'पोर्टल पर आवेदन करें।' }],
    officialUrl: 'https://scholarships.gov.in/',
    deadline: null,
    lastVerified: '2026-08-15',
    tags: ['fixture'],
    isDemoData: true,
    ...overrides,
  };
}
