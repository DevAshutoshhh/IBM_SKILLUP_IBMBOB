import type { DocumentDefinition, DocumentId } from '../types';

/**
 * The document catalogue. SaathiSetu never asks a student to upload any of
 * these — it only helps them track whether they have each one to hand.
 */
export const DOCUMENTS: DocumentDefinition[] = [
  {
    id: 'identity_proof',
    label: { en: 'Identity proof', hi: 'पहचान प्रमाण' },
    why: {
      en: 'Portals need one government-issued identity document to confirm you are the person applying.',
      hi: 'पोर्टल को यह पुष्टि करने के लिए एक सरकारी पहचान दस्तावेज़ चाहिए कि आवेदन आप ही कर रहे हैं।',
    },
    expires: false,
  },
  {
    id: 'student_id',
    label: { en: 'Student ID card', hi: 'छात्र पहचान पत्र' },
    why: {
      en: 'Shows that you are currently enrolled at the institution you named in the form.',
      hi: 'यह दिखाता है कि आप उसी संस्थान में वर्तमान में नामांकित हैं जो आपने फ़ॉर्म में बताया है।',
    },
    expires: true,
  },
  {
    id: 'admission_proof',
    label: { en: 'Admission proof or bonafide certificate', hi: 'प्रवेश प्रमाण या बोनाफाइड प्रमाणपत्र' },
    why: {
      en: 'Confirms your admission in the current academic year, which most scheme timelines are tied to.',
      hi: 'यह चालू शैक्षणिक वर्ष में आपके प्रवेश की पुष्टि करता है, जिससे अधिकांश योजनाओं की समय-सीमा जुड़ी होती है।',
    },
    expires: true,
  },
  {
    id: 'previous_marksheet',
    label: { en: 'Previous year marksheet', hi: 'पिछले वर्ष की अंकतालिका' },
    why: {
      en: 'Used to check any minimum-marks condition and to compare applicants where funds are limited.',
      hi: 'न्यूनतम अंकों की शर्त जाँचने और सीमित धनराशि होने पर आवेदकों की तुलना करने के लिए उपयोग होती है।',
    },
    expires: false,
  },
  {
    id: 'current_academic_record',
    label: { en: 'Current academic record', hi: 'वर्तमान शैक्षणिक रिकॉर्ड' },
    why: {
      en: 'Some schemes ask for attendance or ongoing semester results before releasing an instalment.',
      hi: 'कुछ योजनाएँ किस्त जारी करने से पहले उपस्थिति या चालू सेमेस्टर के परिणाम माँगती हैं।',
    },
    expires: true,
  },
  {
    id: 'income_certificate',
    label: { en: 'Family income certificate', hi: 'पारिवारिक आय प्रमाणपत्र' },
    why: {
      en: 'Means-based schemes verify family income with a certificate from the revenue authority. These usually expire within a year.',
      hi: 'आय-आधारित योजनाएँ राजस्व अधिकारी के प्रमाणपत्र से पारिवारिक आय की पुष्टि करती हैं। ये आमतौर पर एक वर्ष में समाप्त हो जाते हैं।',
    },
    expires: true,
  },
  {
    id: 'domicile_certificate',
    label: { en: 'Domicile or residence certificate', hi: 'निवास प्रमाणपत्र' },
    why: {
      en: 'State schemes are limited to residents of that State or Union Territory.',
      hi: 'राज्य की योजनाएँ उसी राज्य या केंद्र शासित प्रदेश के निवासियों तक सीमित होती हैं।',
    },
    expires: false,
  },
  {
    id: 'category_certificate',
    label: { en: 'Caste or category certificate', hi: 'जाति या श्रेणी प्रमाणपत्र' },
    why: {
      en: 'Needed only when a scheme reserves places for a specific social category.',
      hi: 'केवल तभी आवश्यक है जब कोई योजना किसी विशेष सामाजिक श्रेणी के लिए स्थान आरक्षित करती हो।',
    },
    expires: false,
  },
  {
    id: 'disability_certificate',
    label: { en: 'Disability certificate (UDID)', hi: 'दिव्यांगता प्रमाणपत्र (यूडीआईडी)' },
    why: {
      en: 'Schemes for students with disabilities ask for a certificate stating the recognised percentage.',
      hi: 'दिव्यांग छात्रों की योजनाओं में मान्यता प्राप्त प्रतिशत बताने वाला प्रमाणपत्र माँगा जाता है।',
    },
    expires: true,
  },
  {
    id: 'minority_certificate',
    label: { en: 'Minority community declaration', hi: 'अल्पसंख्यक समुदाय घोषणा' },
    why: {
      en: 'Minority education schemes ask for a declaration or certificate of community.',
      hi: 'अल्पसंख्यक शिक्षा योजनाओं में समुदाय की घोषणा या प्रमाणपत्र माँगा जाता है।',
    },
    expires: false,
  },
  {
    id: 'fee_receipt',
    label: { en: 'Fee receipt', hi: 'शुल्क रसीद' },
    why: {
      en: 'Reimbursement schemes release money against fees you have already paid.',
      hi: 'प्रतिपूर्ति योजनाएँ पहले से भुगतान किए गए शुल्क के आधार पर धनराशि जारी करती हैं।',
    },
    expires: true,
  },
  {
    id: 'bank_account_proof',
    label: { en: 'Bank account proof', hi: 'बैंक खाता प्रमाण' },
    why: {
      en: 'Payments are transferred directly to a bank account in the student’s own name.',
      hi: 'भुगतान सीधे छात्र के अपने नाम के बैंक खाते में स्थानांतरित किया जाता है।',
    },
    expires: false,
  },
  {
    id: 'photograph',
    label: { en: 'Recent passport-size photograph', hi: 'हाल की पासपोर्ट आकार की तस्वीर' },
    why: {
      en: 'Most application forms include a photograph field with a size and format limit.',
      hi: 'अधिकांश आवेदन फ़ॉर्म में आकार और प्रारूप की सीमा वाला फ़ोटो फ़ील्ड होता है।',
    },
    expires: false,
  },
  {
    id: 'personal_statement',
    label: { en: 'Personal statement', hi: 'व्यक्तिगत विवरण' },
    why: {
      en: 'A short written note about your goals. Writing it early gives you time to improve it.',
      hi: 'आपके लक्ष्यों के बारे में एक छोटा लिखित विवरण। इसे पहले लिखने से सुधारने का समय मिलता है।',
    },
    expires: false,
  },
  {
    id: 'recommendation_letter',
    label: { en: 'Recommendation letter', hi: 'अनुशंसा पत्र' },
    why: {
      en: 'A teacher or principal must write this, so request it well before the deadline.',
      hi: 'यह शिक्षक या प्राचार्य को लिखना होता है, इसलिए अंतिम तिथि से काफ़ी पहले अनुरोध करें।',
    },
    expires: false,
  },
];

const DOCUMENT_BY_ID = new Map(DOCUMENTS.map((doc) => [doc.id, doc]));

export function getDocument(id: DocumentId): DocumentDefinition | undefined {
  return DOCUMENT_BY_ID.get(id);
}
