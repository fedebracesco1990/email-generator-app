import React, { useState } from 'react';
import styles from '../app/page.module.css';

const EmailPreview = ({ emailHTML }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailHTML)
      .then(() => {
        setCopySuccess(true);
        // Resetear el mensaje después de 2 segundos
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Error al copiar el HTML:', err);
      });
  };

  return (
    <div className={styles.previewPanel}>
      <h2>Vista Previa</h2>
      <div className={styles.emailPreview}>
        {/* Usamos un key basado en un hash simple del contenido para evitar actualizaciones innecesarias */}
        <div 
          key={emailHTML.length + (emailHTML.charCodeAt(0) || 0)}
          dangerouslySetInnerHTML={{ __html: emailHTML }} 
        />
      </div>
      
      {/* Botón flotante para copiar HTML */}
      <button 
        className={styles.copyButton}
        onClick={copyToClipboard}
      >
        {copySuccess ? '¡Copiado!' : 'Copiar HTML'}
      </button>
    </div>
  );
};

export default EmailPreview;
