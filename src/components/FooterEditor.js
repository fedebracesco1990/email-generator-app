import React from 'react';
import styles from '../app/page.module.css';

// Componente para mostrar variables de imagen con vista previa
const ImageVariableInput = ({ id, value, onChange, placeholder }) => (
  <div className={styles.imageUrlContainer}>
    <input
      id={id}
      type="text"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder || 'Ingresa URL de la imagen'}
      className={styles.input}
    />
    {value && (
      <div className={styles.imagePreview}>
        <img 
          src={value}
          alt="Vista previa"
          className={styles.previewImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
          }}
        />
      </div>
    )}
  </div>
);

// Componente para mostrar variables de link con botón de prueba
const LinkVariableInput = ({ id, value, onChange, placeholder }) => (
  <div className={styles.linkUrlContainer}>
    <input
      id={id}
      type="text"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder || 'Ingresa URL del enlace'}
      className={styles.input}
    />
    {value && (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        className={styles.testLink}
      >
        Probar
      </a>
    )}
  </div>
);

// Componente para mostrar variables de texto
const TextVariableInput = ({ id, value, onChange, placeholder }) => (
  <input
    id={id}
    type="text"
    value={value || ''}
    onChange={onChange}
    placeholder={placeholder || 'Ingresa texto'}
    className={styles.input}
  />
);

const FooterEditor = ({ 
  selectedFooter, 
  availableFooters, 
  setSelectedFooter, 
  footerVariables, 
  variableValues, 
  setVariableValues, 
  isImageVariable,
  categorizedVariables
}) => {
  return (
    <div className={styles.controlSection}>
      <h2>Pie de Página</h2>
      <select
        value={selectedFooter}
        onChange={(e) => setSelectedFooter(e.target.value)}
        className={styles.select}
      >
        {availableFooters.map(footer => (
          <option key={footer} value={footer}>{footer}</option>
        ))}
      </select>
      
      {/* Variables de pie de página */}
      {footerVariables[selectedFooter] && footerVariables[selectedFooter].length > 0 && (
        <div className={styles.variablesSection}>
          <h3>Variables del Pie de Página</h3>
          
          {/* Variables categorizadas si están disponibles */}
          {categorizedVariables?.footer?.[selectedFooter] ? (
            <>
              {/* Imágenes */}
              {categorizedVariables.footer[selectedFooter].images.length > 0 && (
                <div className={styles.variableCategory}>
                  <h5>Imágenes</h5>
                  {categorizedVariables.footer[selectedFooter].images.map(variable => (
                    <div key={variable} className={styles.variableInput}>
                      <label htmlFor={`footer_${selectedFooter}_${variable}`}>{variable}:</label>
                      <ImageVariableInput 
                        id={`footer_${selectedFooter}_${variable}`}
                        value={variableValues[`footer_${selectedFooter}_${variable}`]}
                        placeholder="Ingresa URL de la imagen"
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`footer_${selectedFooter}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._footerUpdateTimer);
                          window._footerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Enlaces */}
              {categorizedVariables.footer[selectedFooter].links.length > 0 && (
                <div className={styles.variableCategory}>
                  <h5>Enlaces</h5>
                  {categorizedVariables.footer[selectedFooter].links.map(variable => (
                    <div key={variable} className={styles.variableInput}>
                      <label htmlFor={`footer_${selectedFooter}_${variable}`}>{variable}:</label>
                      <LinkVariableInput 
                        id={`footer_${selectedFooter}_${variable}`}
                        value={variableValues[`footer_${selectedFooter}_${variable}`]}
                        placeholder="Ingresa URL del enlace"
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`footer_${selectedFooter}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._footerUpdateTimer);
                          window._footerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Atributos */}
              {categorizedVariables.footer[selectedFooter].attributes.length > 0 && (
                <div className={styles.variableCategory}>
                  <h5>Atributos</h5>
                  {categorizedVariables.footer[selectedFooter].attributes.map(variable => (
                    <div key={variable} className={styles.variableInput}>
                      <label htmlFor={`footer_${selectedFooter}_${variable}`}>{variable}:</label>
                      <TextVariableInput 
                        id={`footer_${selectedFooter}_${variable}`}
                        value={variableValues[`footer_${selectedFooter}_${variable}`]}
                        placeholder={`Atributo para ${variable}`}
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`footer_${selectedFooter}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._footerUpdateTimer);
                          window._footerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Textos */}
              {categorizedVariables.footer[selectedFooter].texts.length > 0 && (
                <div className={styles.variableCategory}>
                  <h5>Textos</h5>
                  {categorizedVariables.footer[selectedFooter].texts.map(variable => (
                    <div key={variable} className={styles.variableInput}>
                      <label htmlFor={`footer_${selectedFooter}_${variable}`}>{variable}:</label>
                      <TextVariableInput 
                        id={`footer_${selectedFooter}_${variable}`}
                        value={variableValues[`footer_${selectedFooter}_${variable}`]}
                        placeholder={`Texto para ${variable}`}
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`footer_${selectedFooter}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._footerUpdateTimer);
                          window._footerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Vista fallback si no hay variables categorizadas
            footerVariables[selectedFooter].map(variable => (
              <div key={variable} className={styles.variableInput}>
                <label htmlFor={`footer_${selectedFooter}_${variable}`}>{variable}:</label>
                {isImageVariable(variable) ? (
                  <ImageVariableInput 
                    id={`footer_${selectedFooter}_${variable}`}
                    value={variableValues[`footer_${selectedFooter}_${variable}`]}
                    placeholder="Ingresa URL de la imagen"
                    onChange={(e) => {
                      const newValues = {
                        ...variableValues,
                        [`footer_${selectedFooter}_${variable}`]: e.target.value
                      };
                      setVariableValues(newValues);
                      clearTimeout(window._footerUpdateTimer);
                      window._footerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                    }}
                  />
                ) : (
                  <TextVariableInput 
                    id={`footer_${selectedFooter}_${variable}`}
                    value={variableValues[`footer_${selectedFooter}_${variable}`]}
                    placeholder={`Valor para ${variable}`}
                    onChange={(e) => {
                      const newValues = {
                        ...variableValues,
                        [`footer_${selectedFooter}_${variable}`]: e.target.value
                      };
                      setVariableValues(newValues);
                      clearTimeout(window._footerUpdateTimer);
                      window._footerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FooterEditor;
