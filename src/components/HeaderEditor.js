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

const HeaderEditor = ({ 
  selectedHeader, 
  availableHeaders, 
  setSelectedHeader, 
  headerVariables, 
  variableValues, 
  setVariableValues, 
  isImageVariable,
  categorizedVariables
}) => {
  return (
    <div className={styles.controlSection}>
      <h2>Encabezado</h2>
      <select 
        value={selectedHeader} 
        onChange={(e) => setSelectedHeader(e.target.value)}
        className={styles.select}
      >
        {availableHeaders.map(header => (
          <option key={header} value={header}>{header}</option>
        ))}
      </select>
      
      {/* Variables de encabezado */}
      {headerVariables[selectedHeader] && headerVariables[selectedHeader].length > 0 && (
        <div className={styles.variablesSection}>
          <h3>Variables del Encabezado</h3>
          
          {/* Variables categorizadas si están disponibles */}
          {categorizedVariables?.header?.[selectedHeader] ? (
            <>
              {/* Imágenes */}
              {categorizedVariables.header[selectedHeader].images.length > 0 && (
                <div className={styles.variableCategory}>
                  <h4>Imágenes</h4>
                  {categorizedVariables.header[selectedHeader].images.map(variable => (
                    <div key={variable} className={styles.variableInput}>
                      <label htmlFor={`header_${selectedHeader}_${variable}`}>{variable}:</label>
                      <ImageVariableInput 
                        id={`header_${selectedHeader}_${variable}`}
                        value={variableValues[`header_${selectedHeader}_${variable}`]}
                        placeholder="Ingresa URL de la imagen"
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`header_${selectedHeader}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._headerUpdateTimer);
                          window._headerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Enlaces */}
              {categorizedVariables.header[selectedHeader].links.length > 0 && (
                <div className={styles.variableCategory}>
                  <h4>Enlaces</h4>
                  {categorizedVariables.header[selectedHeader].links.map(variable => (
                    <div key={variable} className={styles.variableInput}>
                      <label htmlFor={`header_${selectedHeader}_${variable}`}>{variable}:</label>
                      <LinkVariableInput 
                        id={`header_${selectedHeader}_${variable}`}
                        value={variableValues[`header_${selectedHeader}_${variable}`]}
                        placeholder="Ingresa URL del enlace"
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`header_${selectedHeader}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._headerUpdateTimer);
                          window._headerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Atributos */}
              {categorizedVariables.header[selectedHeader].attributes.length > 0 && (
                <div className={styles.variableCategory}>
                  <h4>Atributos</h4>
                  {categorizedVariables.header[selectedHeader].attributes.map(variable => (
                    <div key={variable} className={styles.variableInput}>
                      <label htmlFor={`header_${selectedHeader}_${variable}`}>{variable}:</label>
                      <TextVariableInput 
                        id={`header_${selectedHeader}_${variable}`}
                        value={variableValues[`header_${selectedHeader}_${variable}`]}
                        placeholder={`Atributo para ${variable}`}
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`header_${selectedHeader}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._headerUpdateTimer);
                          window._headerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Textos */}
              {categorizedVariables.header[selectedHeader].texts.length > 0 && (
                <div className={styles.variableCategory}>
                  <h4>Textos</h4>
                  {categorizedVariables.header[selectedHeader].texts.map(variable => (
                    <div key={variable} className={styles.variableInput}>
                      <label htmlFor={`header_${selectedHeader}_${variable}`}>{variable}:</label>
                      <TextVariableInput 
                        id={`header_${selectedHeader}_${variable}`}
                        value={variableValues[`header_${selectedHeader}_${variable}`]}
                        placeholder={`Texto para ${variable}`}
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`header_${selectedHeader}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._headerUpdateTimer);
                          window._headerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Vista fallback si no hay variables categorizadas
            headerVariables[selectedHeader].map(variable => (
              <div key={variable} className={styles.variableInput}>
                <label htmlFor={`header_${selectedHeader}_${variable}`}>{variable}:</label>
                {isImageVariable(variable) ? (
                  <ImageVariableInput 
                    id={`header_${selectedHeader}_${variable}`}
                    value={variableValues[`header_${selectedHeader}_${variable}`]}
                    placeholder="Ingresa URL de la imagen"
                    onChange={(e) => {
                      const newValues = {
                        ...variableValues,
                        [`header_${selectedHeader}_${variable}`]: e.target.value
                      };
                      setVariableValues(newValues);
                      clearTimeout(window._headerUpdateTimer);
                      window._headerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                    }}
                  />
                ) : (
                  <TextVariableInput 
                    id={`header_${selectedHeader}_${variable}`}
                    value={variableValues[`header_${selectedHeader}_${variable}`]}
                    placeholder={`Valor para ${variable}`}
                    onChange={(e) => {
                      const newValues = {
                        ...variableValues,
                        [`header_${selectedHeader}_${variable}`]: e.target.value
                      };
                      setVariableValues(newValues);
                      clearTimeout(window._headerUpdateTimer);
                      window._headerUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
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

export default HeaderEditor;
