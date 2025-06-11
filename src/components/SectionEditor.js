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
  changeSection, // Add the changeSection prop
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
                // Call the changeSection function from the parent component
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
              <h4>Variables de la sección {index + 1}</h4>
              
              {/* Variables categorizadas si están disponibles */}
              {categorizedVariables?.section?.[section] ? (
                <>
                  {/* Imágenes */}
                  {categorizedVariables.section[section].images.length > 0 && (
                    <div className={styles.variableCategory}>
                      <h5>Imágenes</h5>
                      {categorizedVariables.section[section].images.map(variable => (
                        <div key={`${section}_${index}_${variable}`} className={styles.variableInput}>
                          <label htmlFor={`section_${section}_${index}_${variable}`}>{variable}:</label>
                          <ImageVariableInput 
                            id={`section_${section}_${index}_${variable}`}
                            value={variableValues[`section_${section}_${index}_${variable}`]}
                            placeholder="Ingresa URL de la imagen"
                            onChange={(e) => {
                              const newValues = {
                                ...variableValues,
                                [`section_${section}_${index}_${variable}`]: e.target.value
                              };
                              setVariableValues(newValues);
                              clearTimeout(window._sectionUpdateTimer);
                              window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Enlaces */}
                  {categorizedVariables.section[section].links.length > 0 && (
                    <div className={styles.variableCategory}>
                      <h5>Enlaces</h5>
                      {categorizedVariables.section[section].links.map(variable => (
                        <div key={`${section}_${index}_${variable}`} className={styles.variableInput}>
                          <label htmlFor={`section_${section}_${index}_${variable}`}>{variable}:</label>
                          <LinkVariableInput 
                            id={`section_${section}_${index}_${variable}`}
                            value={variableValues[`section_${section}_${index}_${variable}`]}
                            placeholder="Ingresa URL del enlace"
                            onChange={(e) => {
                              const newValues = {
                                ...variableValues,
                                [`section_${section}_${index}_${variable}`]: e.target.value
                              };
                              setVariableValues(newValues);
                              clearTimeout(window._sectionUpdateTimer);
                              window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Atributos */}
                  {categorizedVariables.section[section].attributes.length > 0 && (
                    <div className={styles.variableCategory}>
                      <h5>Atributos</h5>
                      {categorizedVariables.section[section].attributes.map(variable => (
                        <div key={`${section}_${index}_${variable}`} className={styles.variableInput}>
                          <label htmlFor={`section_${section}_${index}_${variable}`}>{variable}:</label>
                          <TextVariableInput 
                            id={`section_${section}_${index}_${variable}`}
                            value={variableValues[`section_${section}_${index}_${variable}`]}
                            placeholder={`Atributo para ${variable}`}
                            onChange={(e) => {
                              const newValues = {
                                ...variableValues,
                                [`section_${section}_${index}_${variable}`]: e.target.value
                              };
                              setVariableValues(newValues);
                              clearTimeout(window._sectionUpdateTimer);
                              window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Textos */}
                  {categorizedVariables.section[section].texts.length > 0 && (
                    <div className={styles.variableCategory}>
                      <h5>Textos</h5>
                      {categorizedVariables.section[section].texts.map(variable => (
                        <div key={`${section}_${index}_${variable}`} className={styles.variableInput}>
                          <label htmlFor={`section_${section}_${index}_${variable}`}>{variable}:</label>
                          <TextVariableInput 
                            id={`section_${section}_${index}_${variable}`}
                            value={variableValues[`section_${section}_${index}_${variable}`]}
                            placeholder={`Texto para ${variable}`}
                            onChange={(e) => {
                              const newValues = {
                                ...variableValues,
                                [`section_${section}_${index}_${variable}`]: e.target.value
                              };
                              setVariableValues(newValues);
                              clearTimeout(window._sectionUpdateTimer);
                              window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Vista fallback si no hay variables categorizadas
                sectionVariables[section].map(variable => (
                  <div key={`${section}_${index}_${variable}`} className={styles.variableInput}>
                    <label htmlFor={`section_${section}_${index}_${variable}`}>{variable}:</label>
                    {isImageVariable(variable) ? (
                      <ImageVariableInput 
                        id={`section_${section}_${index}_${variable}`}
                        value={variableValues[`section_${section}_${index}_${variable}`]}
                        placeholder="Ingresa URL de la imagen"
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`section_${section}_${index}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._sectionUpdateTimer);
                          window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    ) : (
                      <TextVariableInput 
                        id={`section_${section}_${index}_${variable}`}
                        value={variableValues[`section_${section}_${index}_${variable}`]}
                        placeholder={`Valor para ${variable}`}
                        onChange={(e) => {
                          const newValues = {
                            ...variableValues,
                            [`section_${section}_${index}_${variable}`]: e.target.value
                          };
                          setVariableValues(newValues);
                          clearTimeout(window._sectionUpdateTimer);
                          window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                        }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
      <button onClick={addSection} className={styles.addButton}>Agregar Sección</button>
    </div>
  );
};

export default SectionEditor;
