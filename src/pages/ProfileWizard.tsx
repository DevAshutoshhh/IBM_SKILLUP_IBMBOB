import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Lock, Sparkles } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { CheckboxGroup, RadioGroup, SelectField, type Choice } from '../components/FormFields';
import { ProgressBar } from '../components/Indicators';
import { STATES } from '../data/states';
import { INCOME_BAND_ORDER, MARKS_BAND_ORDER } from '../data/bands';
import { pick } from '../i18n';
import type {
  EducationLevel,
  Gender,
  IncomeBand,
  Locality,
  MarksBand,
  OptionalFlag,
  PageId,
  SocialCategory,
  StudyArea,
  SupportType,
} from '../types';

interface ProfileWizardProps {
  onNavigate: (page: PageId) => void;
}

const EDUCATION_LEVELS: EducationLevel[] = [
  'class_9_10',
  'class_11_12',
  'iti_diploma',
  'undergraduate',
  'postgraduate',
  'doctoral',
];

const STUDY_AREAS: StudyArea[] = [
  'science',
  'commerce',
  'arts_humanities',
  'engineering',
  'medical_health',
  'management',
  'vocational',
  'other',
  'not_sure',
];

const CATEGORIES: SocialCategory[] = ['general', 'ews', 'obc', 'sc', 'st', 'prefer_not_to_say'];
const GENDERS: Gender[] = ['female', 'male', 'other', 'prefer_not_to_say'];
const FLAGS: OptionalFlag[] = ['yes', 'no', 'prefer_not_to_say'];
const LOCALITIES: Locality[] = ['rural', 'urban', 'prefer_not_to_say'];
const SUPPORT_TYPES: SupportType[] = [
  'tuition',
  'living_expenses',
  'study_materials',
  'digital_learning',
  'skill_development',
  'internship_career',
];

const TOTAL_STEPS = 5;

export function ProfileWizard({ onNavigate }: ProfileWizardProps) {
  const { t, language, state, updateProfile } = useAppState();
  const profile = state.profile;
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const choices = useMemo(
    () => ({
      education: EDUCATION_LEVELS.map<Choice<EducationLevel>>((value) => ({
        value,
        label: t(`education.${value}`),
      })),
      studyArea: STUDY_AREAS.map<Choice<StudyArea>>((value) => ({ value, label: t(`studyArea.${value}`) })),
      income: INCOME_BAND_ORDER.map<Choice<IncomeBand>>((value) => ({ value, label: t(`income.${value}`) })),
      marks: MARKS_BAND_ORDER.map<Choice<MarksBand>>((value) => ({ value, label: t(`marks.${value}`) })),
      category: CATEGORIES.map<Choice<SocialCategory>>((value) => ({ value, label: t(`category.${value}`) })),
      gender: GENDERS.map<Choice<Gender>>((value) => ({ value, label: t(`gender.${value}`) })),
      flag: FLAGS.map<Choice<OptionalFlag>>((value) => ({ value, label: t(`flag.${value}`) })),
      locality: LOCALITIES.map<Choice<Locality>>((value) => ({ value, label: t(`locality.${value}`) })),
      support: SUPPORT_TYPES.map<Choice<SupportType>>((value) => ({ value, label: t(`support.${value}`) })),
    }),
    [t],
  );

  /** Only the first two steps have a required answer; the rest are optional. */
  const stepIsComplete = (current: number): boolean => {
    if (current === 1) return profile.educationLevel !== null;
    if (current === 2) return profile.state !== null;
    return true;
  };

  const focusHeading = () => {
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const goNext = () => {
    if (!stepIsComplete(step)) {
      setError(t('profile.validation.required'));
      return;
    }
    setError(null);
    if (step === TOTAL_STEPS) {
      onNavigate('matches');
      return;
    }
    setStep((current) => current + 1);
    focusHeading();
  };

  const goBack = () => {
    setError(null);
    setStep((current) => Math.max(1, current - 1));
    focusHeading();
  };

  const stepTitle = t(`profile.step${step}.title`);

  return (
    <div className="page page--narrow">
      <header className="page__header">
        <h1 className="page__title">{t('profile.title')}</h1>
        <p className="page__lead">{t('profile.intro')}</p>
        <p className="notice notice--info">
          <Lock aria-hidden="true" size={18} />
          {t('profile.privacyNote')}
        </p>
      </header>

      <div className="wizard">
        <div className="wizard__progress">
          <ProgressBar
            value={(step / TOTAL_STEPS) * 100}
            label={t('common.stepOf', { current: step, total: TOTAL_STEPS })}
            valueText={`${step}/${TOTAL_STEPS}`}
          />
        </div>

        <h2 className="wizard__step-title" tabIndex={-1} ref={headingRef}>
          {stepTitle}
        </h2>

        {error ? (
          <p className="notice notice--critical" role="alert">
            {t('profile.validation.summary')}
          </p>
        ) : null}

        <form
          className="wizard__form"
          onSubmit={(event) => {
            event.preventDefault();
            goNext();
          }}
          noValidate
        >
          {step === 1 ? (
            <>
              <RadioGroup
                name="educationLevel"
                label={t('profile.field.educationLevel')}
                value={profile.educationLevel}
                choices={choices.education}
                onChange={(value) => {
                  updateProfile({ educationLevel: value });
                  setError(null);
                }}
                error={error ?? undefined}
              />
              <RadioGroup
                name="studyArea"
                label={t('profile.field.studyArea')}
                value={profile.studyArea}
                choices={choices.studyArea}
                optional
                optionalLabel={t('common.optional')}
                onChange={(value) => updateProfile({ studyArea: value })}
              />
            </>
          ) : null}

          {step === 2 ? (
            <SelectField
              label={t('profile.field.state')}
              value={profile.state ?? ''}
              placeholder="—"
              options={STATES.map((entry) => ({ value: entry.code, label: pick(entry.label, language) }))}
              onChange={(value) => {
                updateProfile({ state: value || null });
                setError(null);
              }}
              error={error ?? undefined}
            />
          ) : null}

          {step === 3 ? (
            <>
              <RadioGroup
                name="incomeBand"
                label={t('profile.field.incomeBand')}
                help={t('profile.field.incomeHelp')}
                value={profile.incomeBand}
                choices={choices.income}
                optional
                optionalLabel={t('common.optional')}
                onChange={(value) => updateProfile({ incomeBand: value })}
              />
              <RadioGroup
                name="marksBand"
                label={t('profile.field.marksBand')}
                help={t('profile.field.marksHelp')}
                value={profile.marksBand}
                choices={choices.marks}
                optional
                optionalLabel={t('common.optional')}
                onChange={(value) => updateProfile({ marksBand: value })}
              />
            </>
          ) : null}

          {step === 4 ? (
            <>
              <p className="notice notice--info">
                <Info aria-hidden="true" size={18} />
                {t('profile.sensitiveNote')}
              </p>
              <RadioGroup
                name="socialCategory"
                label={t('profile.field.socialCategory')}
                value={profile.socialCategory}
                choices={choices.category}
                optional
                optionalLabel={t('common.optional')}
                onChange={(value) => updateProfile({ socialCategory: value })}
              />
              <RadioGroup
                name="gender"
                label={t('profile.field.gender')}
                value={profile.gender}
                choices={choices.gender}
                optional
                optionalLabel={t('common.optional')}
                onChange={(value) => updateProfile({ gender: value })}
              />
              <RadioGroup
                name="disability"
                label={t('profile.field.disability')}
                value={profile.disability}
                choices={choices.flag}
                optional
                optionalLabel={t('common.optional')}
                onChange={(value) => updateProfile({ disability: value })}
              />
              <RadioGroup
                name="minority"
                label={t('profile.field.minority')}
                value={profile.minority}
                choices={choices.flag}
                optional
                optionalLabel={t('common.optional')}
                onChange={(value) => updateProfile({ minority: value })}
              />
              <RadioGroup
                name="locality"
                label={t('profile.field.locality')}
                value={profile.locality}
                choices={choices.locality}
                optional
                optionalLabel={t('common.optional')}
                onChange={(value) => updateProfile({ locality: value })}
              />
            </>
          ) : null}

          {step === 5 ? (
            <>
              <CheckboxGroup
                name="supportNeeded"
                label={t('profile.field.supportNeeded')}
                help={t('profile.field.supportHelp')}
                values={profile.supportNeeded}
                choices={choices.support}
                onChange={(values) => updateProfile({ supportNeeded: values })}
              />
              <div className="wizard__review">
                <h3 className="wizard__review-title">
                  <CheckCircle2 aria-hidden="true" size={18} />
                  {t('profile.reviewTitle')}
                </h3>
                <p>{t('profile.reviewBody')}</p>
              </div>
            </>
          ) : null}

          <div className="wizard__actions">
            {step > 1 ? (
              <button type="button" className="button button--ghost" onClick={goBack}>
                <ArrowLeft aria-hidden="true" size={18} />
                {t('common.back')}
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="button button--primary">
              {step === TOTAL_STEPS ? (
                <>
                  <Sparkles aria-hidden="true" size={18} />
                  {t('profile.finish')}
                </>
              ) : (
                <>
                  {t('common.next')}
                  <ArrowRight aria-hidden="true" size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="wizard__note">{t('profile.saveNote')}</p>
      </div>
    </div>
  );
}
