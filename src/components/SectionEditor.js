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

const SectionEditor = ({ 
  selectedSections, 
  availableSections, 
  addSection, 
  removeSection, 
  changeSection, 
  sectionVariables, 
  variableValues, 
  setVariableValues, 
  isImageVariable,
  categorizedVariables
}) => {
  return (
    <div className={styles.controlSection}>
      <h2>Secciones</h2>
      {selectedSections.map((section, index) => (
        <div key={index} className={styles.sectionBlock}>
          <div className={styles.sectionControl}>
            <select
              value={section}
              onChange={(e) => {
                changeSection(index, e.target.value);
              }}
              className={styles.select}
            >
              {availableSections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
            <button 
              onClick={() => removeSection(index)} 
              className={styles.removeButton}
              disabled={selectedSections.length <= 1}
            >
              Eliminar
            </button>
          </div>
          
          {/* Variables de sección */}
          {sectionVariables[section] && sectionVariables[section].length > 0 && (
            <div className={styles.variablesSection}>
              <h4>Variables de la sección {index + 1} (en orden de aparición)</h4>
              
              {/* Mostrar variables en orden DOM con controles apropiados */}
              {sectionVariables[section].map(variable => {
                const variableKey = `section_${section}_${index}_${variable}`;
                
                // Determinar el tipo de control y etiqueta basado en el nombre de la variable
                let label = variable;
                let inputType = 'text';
                let placeholder = `Valor para ${variable}`;
                
                if (variable.startsWith('LABEL_')) {
                  label = `📝 Label ${variable.split('_')[1]}`;
                  placeholder = 'Texto de etiqueta corta';
                } else if (variable.startsWith('TITLE_')) {
                  label = `📋 Título ${variable.split('_')[1]}`;
                  placeholder = 'Título de sección (puede incluir HTML)';
                } else if (variable.startsWith('IMG_SRC_')) {
                  label = `🖼️ Imagen ${variable.split('_')[2]} - URL`;
                  inputType = 'image';
                  placeholder = 'URL de la imagen';
                } else if (variable.startsWith('IMG_ALT_')) {
                  label = `🖼️ Imagen ${variable.split('_')[2]} - Descripción`;
                  placeholder = 'Descripción alternativa de la imagen';
                } else if (variable.startsWith('IMG_TITLE_')) {
                  label = `🖼️ Imagen ${variable.split('_')[2]} - Título`;
                  placeholder = 'Título de la imagen';
                } else if (variable.startsWith('PARAGRAPH_')) {
                  label = `📄 Párrafo ${variable.split('_')[1]}`;
                  placeholder = 'Contenido del párrafo';
                } else if (variable.startsWith('BUTTON_HREF_')) {
                  label = `🔗 Botón ${variable.split('_')[2]} - Enlace`;
                  inputType = 'link';
                  placeholder = 'URL del enlace del botón';
                } else if (variable.startsWith('BUTTON_TEXT_')) {
                  label = `🔘 Botón ${variable.split('_')[2]} - Texto`;
                  placeholder = 'Texto del botón';
                } else if (variable.startsWith('LINK_HREF_')) {
                  label = `🔗 Enlace ${variable.split('_')[2]}`;
                  inputType = 'link';
                  placeholder = 'URL del enlace';
                }

                return (
                  <div key={variableKey} className={styles.variableInput}>
                    <label htmlFor={variableKey}>{label}:</label>
                    {inputType === 'image' ? (
                      <ImageVariableInput 
                        id={variableKey}
                        value={variableValues[variableKey]}
                        placeholder={placeholder}
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [variableKey]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._sectionUpdateTimer);
                          window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    ) : inputType === 'link' ? (
                      <LinkVariableInput 
                        id={variableKey}
                        value={variableValues[variableKey]}
                        placeholder={placeholder}
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [variableKey]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._sectionUpdateTimer);
                          window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    ) : (
                      <TextVariableInput 
                        id={variableKey}
                        value={variableValues[variableKey]}
                        placeholder={placeholder}
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [variableKey]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._sectionUpdateTimer);
                          window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <button onClick={addSection} className={styles.addButton}>Agregar Sección</button>
    </div>
  );
};

export default SectionEditor;
