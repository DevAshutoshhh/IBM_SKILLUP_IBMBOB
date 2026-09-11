import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, FileX2, Landmark, Lock, Trash2 } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { describeStoredData } from '../utils/storage';
import { Dialog } from './Dialog';

interface PrivacyPanelProps {
  open: boolean;
  onClose: () => void;
}

export function PrivacyPanel({ open, onClose }: PrivacyPanelProps) {
  const { t, state, canPersist, deleteAllData } = useAppState();
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const inventory = describeStoredData(state);

  const handleDelete = () => {
    deleteAllData();
    setConfirming(false);
    setDeleted(true);
  };

  const handleClose = () => {
    setConfirming(false);
    setDeleted(false);
    onClose();
  };

  return (
    <Dialog open={open} title={t('privacy.title')} onClose={handleClose} size="large">
      <p className="lead">{t('privacy.intro')}</p>

      {!canPersist ? (
        <p className="notice notice--warning" role="status">
          <AlertTriangle aria-hidden="true" size={18} />
          {t('privacy.storageUnavailable')}
        </p>
      ) : null}

      {deleted ? (
        <p className="notice notice--positive" role="status">
          <CheckCircle2 aria-hidden="true" size={18} />
          {t('privacy.delete.done')}
        </p>
      ) : null}

      <section className="privacy-section">
        <h3 className="privacy-section__title">
          <Database aria-hidden="true" size={18} />
          {t('privacy.stored')}
        </h3>
        <ul className="privacy-inventory">
          {inventory.map((item) => (
            <li key={item.key}>
              <span>{t(item.key)}</span>
              <span className="privacy-inventory__count">{item.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="privacy-section">
        <h3 className="privacy-section__title">
          <Lock aria-hidden="true" size={18} />
          {t('privacy.where.title')}
        </h3>
        <p>{t('privacy.where.body')}</p>
      </section>

      <section className="privacy-section">
        <h3 className="privacy-section__title">
          <FileX2 aria-hidden="true" size={18} />
          {t('privacy.uploads.title')}
        </h3>
        <p>{t('privacy.uploads.body')}</p>
      </section>

      <section className="privacy-section">
        <h3 className="privacy-section__title">
          <Landmark aria-hidden="true" size={18} />
          {t('privacy.authority.title')}
        </h3>
        <p>{t('privacy.authority.body')}</p>
      </section>

      <section className="privacy-section">
        <h3 className="privacy-section__title">{t('privacy.notCollected.title')}</h3>
        <p>{t('privacy.notCollected.body')}</p>
      </section>

      <section className="privacy-section privacy-section--danger">
        {confirming ? (
          <div className="confirm-block" role="alertdialog" aria-label={t('privacy.delete.confirmTitle')}>
            <p className="confirm-block__title">{t('privacy.delete.confirmTitle')}</p>
            <p className="confirm-block__body">{t('privacy.delete.confirmBody')}</p>
            <div className="confirm-block__actions">
              <button type="button" className="button button--danger" onClick={handleDelete}>
                <Trash2 aria-hidden="true" size={16} />
                {t('privacy.delete.confirm')}
              </button>
              <button type="button" className="button button--ghost" onClick={() => setConfirming(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="button button--danger-outline"
            onClick={() => {
              setDeleted(false);
              setConfirming(true);
            }}
          >
            <Trash2 aria-hidden="true" size={16} />
            {t('privacy.delete')}
          </button>
        )}
      </section>
    </Dialog>
  );
}
