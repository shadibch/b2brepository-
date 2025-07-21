import React, { useState } from 'react';
import Button from './Button';
import Alert from './Alert';
import Card from './Card';
import Input from './Input';
import Modal from './Modal';
import { t, switchLanguage, getCurrentLanguage, isRTL } from '../../utils/translator';

export default function UITestPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleLangToggle = () => {
    const nextLang = getCurrentLanguage() === 'en-US' ? 'ar-SA' : 'en-US';
    switchLanguage(nextLang);
    window.location.reload();
  };

  return (
    <div className={`min-h-screen p-6 ${isRTL() ? 'rtl' : ''}`}
      dir={isRTL() ? 'rtl' : 'ltr'}
    >
      <div className="flex justify-end mb-4">
        <Button variant="secondary" onClick={handleLangToggle}>
          {t('switch_language')}
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-brand">{t('ui_test_page')}</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="card_title" description="card_description">
          <div className="flex flex-col gap-2">
            <Button onClick={() => setModalOpen(true)}>{t('open_modal')}</Button>
            <Button variant="secondary">{t('secondary_button')}</Button>
            <Button variant="danger">{t('danger_button')}</Button>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Alert variant="success">{t('success_message')}</Alert>
          <Alert variant="error">{t('error_message')}</Alert>
          <Alert variant="info">{t('info_message')}</Alert>
          <Alert variant="warning">{t('warning_message')}</Alert>
        </div>
      </div>

      <Card title="input_demo">
        <Input
          label="your_name"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          error={error}
        />
        <Button onClick={() => setError(inputValue ? '' : 'required_field')}>{t('submit')}</Button>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="modal_title">
        <p>{t('modal_content')}</p>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setModalOpen(false)}>{t('close')}</Button>
        </div>
      </Modal>
    </div>
  );
} 