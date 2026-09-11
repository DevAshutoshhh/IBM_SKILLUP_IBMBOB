import type { Bilingual, StateCode } from '../types';

export interface StateOption {
  code: StateCode;
  label: Bilingual;
}

/** All Indian States and Union Territories, sorted alphabetically by English name. */
export const STATES: StateOption[] = [
  { code: 'AN', label: { en: 'Andaman and Nicobar Islands', hi: 'अंडमान और निकोबार द्वीपसमूह' } },
  { code: 'AP', label: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' } },
  { code: 'AR', label: { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश' } },
  { code: 'AS', label: { en: 'Assam', hi: 'असम' } },
  { code: 'BR', label: { en: 'Bihar', hi: 'बिहार' } },
  { code: 'CH', label: { en: 'Chandigarh', hi: 'चंडीगढ़' } },
  { code: 'CG', label: { en: 'Chhattisgarh', hi: 'छत्तीसगढ़' } },
  { code: 'DN', label: { en: 'Dadra and Nagar Haveli and Daman and Diu', hi: 'दादरा और नगर हवेली तथा दमन और दीव' } },
  { code: 'DL', label: { en: 'Delhi', hi: 'दिल्ली' } },
  { code: 'GA', label: { en: 'Goa', hi: 'गोवा' } },
  { code: 'GJ', label: { en: 'Gujarat', hi: 'गुजरात' } },
  { code: 'HR', label: { en: 'Haryana', hi: 'हरियाणा' } },
  { code: 'HP', label: { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' } },
  { code: 'JK', label: { en: 'Jammu and Kashmir', hi: 'जम्मू और कश्मीर' } },
  { code: 'JH', label: { en: 'Jharkhand', hi: 'झारखंड' } },
  { code: 'KA', label: { en: 'Karnataka', hi: 'कर्नाटक' } },
  { code: 'KL', label: { en: 'Kerala', hi: 'केरल' } },
  { code: 'LA', label: { en: 'Ladakh', hi: 'लद्दाख' } },
  { code: 'LD', label: { en: 'Lakshadweep', hi: 'लक्षद्वीप' } },
  { code: 'MP', label: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' } },
  { code: 'MH', label: { en: 'Maharashtra', hi: 'महाराष्ट्र' } },
  { code: 'MN', label: { en: 'Manipur', hi: 'मणिपुर' } },
  { code: 'ML', label: { en: 'Meghalaya', hi: 'मेघालय' } },
  { code: 'MZ', label: { en: 'Mizoram', hi: 'मिज़ोरम' } },
  { code: 'NL', label: { en: 'Nagaland', hi: 'नागालैंड' } },
  { code: 'OD', label: { en: 'Odisha', hi: 'ओडिशा' } },
  { code: 'PY', label: { en: 'Puducherry', hi: 'पुदुचेरी' } },
  { code: 'PB', label: { en: 'Punjab', hi: 'पंजाब' } },
  { code: 'RJ', label: { en: 'Rajasthan', hi: 'राजस्थान' } },
  { code: 'SK', label: { en: 'Sikkim', hi: 'सिक्किम' } },
  { code: 'TN', label: { en: 'Tamil Nadu', hi: 'तमिलनाडु' } },
  { code: 'TS', label: { en: 'Telangana', hi: 'तेलंगाना' } },
  { code: 'TR', label: { en: 'Tripura', hi: 'त्रिपुरा' } },
  { code: 'UP', label: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' } },
  { code: 'UK', label: { en: 'Uttarakhand', hi: 'उत्तराखंड' } },
  { code: 'WB', label: { en: 'West Bengal', hi: 'पश्चिम बंगाल' } },
];

const STATE_BY_CODE = new Map(STATES.map((state) => [state.code, state]));

export function getStateLabel(code: StateCode): Bilingual | null {
  return STATE_BY_CODE.get(code)?.label ?? null;
}
