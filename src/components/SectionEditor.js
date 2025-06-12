import React from 'react';
import styles from '../app/page.module.css';

// Componente para mostrar variables de imagen con vista previa
const ImageVariableInput = ({ id, value, onChange, placeholder }) => {
  // Asegurarnos de que value sea siempre una cadena de texto
  const safeValue = typeof value === 'string' ? value : (value ? String(value) : '');
  
  // Función para manejar el cambio asegurando que siempre devolveremos una cadena
  const handleSafeChange = (e) => {
    onChange(e.target.value);
  };
  
  return (
    <div className={styles.imageUrlContainer}>
      <input
        id={id}
        type="text"
        value={safeValue}
        onChange={handleSafeChange}
        placeholder={placeholder || 'Ingresa URL de la imagen'}
        className={styles.input}
      />
    {safeValue && (
      <div className={styles.imagePreview}>
        <img 
          src={safeValue}
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
};

// Componente para mostrar variables de link con botón de prueba
const LinkVariableInput = ({ id, value, onChange, placeholder }) => {
  // Asegurarnos de que value sea siempre una cadena de texto
  const safeValue = typeof value === 'string' ? value : (value ? String(value) : '');
  
  // Función para manejar el cambio asegurando que siempre devolveremos una cadena
  const handleSafeChange = (e) => {
    onChange(e.target.value);
  };
  
  return (
    <div className={styles.linkUrlContainer}>
      <input
        id={id}
        type="text"
        value={safeValue}
        onChange={handleSafeChange}
        placeholder={placeholder || 'Ingresa URL del enlace'}
        className={styles.input}
      />
      {safeValue && (
        <a 
          href={safeValue} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.testLink}
        >
          Probar
        </a>
      )}
    </div>
  );
};

// Component for text variables display
const TextVariableInput = ({ id, value, onChange, placeholder, multiline = false }) => {
  // Handle change for both input and textarea
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  
  return multiline ? (
    <textarea
      id={id}
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder || 'Enter text'}
      className={`${styles.input} ${styles.textareaInput}`}
      rows={3}
    />
  ) : (
    <input
      id={id}
      type="text"
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder || 'Enter text'}
      className={styles.input}
    />
  );
};

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
  categorizedVariables,
  categorizeVariable // Añadimos la prop categorizeVariable
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
              
              {/* Variables ordenadas según aparecen en el template */}
              {categorizedVariables?.section?.[section] ? (
                <>
                  {/* Mostrar todas las variables en el orden en que aparecen en el template */}
                  {(() => {
                    // Obtener todas las variables para esta sección
                    const allVariables = sectionVariables[section] || [];
                    
                    if (allVariables.length > 0) {
                      return (
                        <div className={styles.variableCategory}>
                          {allVariables.map(variable => {
                            const variableKey = `section_${section}_${index}_${variable}`;
                            const variableValue = variableValues[variableKey] || '';
                            const variableType = categorizeVariable(variable);
                            
                            // Función común de actualización para todos los campos
                            const handleChange = (newValue) => {
                              const newValues = {
                                ...variableValues,
                                [variableKey]: newValue
                              };
                              setVariableValues(newValues);
                              clearTimeout(window._sectionUpdateTimer);
                              window._sectionUpdateTimer = setTimeout(() => window.updateEmailPreview(), 300);
                            };
                            
                            // Determinar si es parte de un par
                            const isPart = variable.includes('PAIR_');
                            const pairNumber = isPart ? variable.split('_').pop() : null;
                            const isStart = isPart && variable.includes('LINK_PAIR_');
                            const isEnd = isPart && variable.includes('BUTTON_PAIR_');
                            
                            // Determinar si es un título para aplicar estilos
                            const isTitle = variableType === 'title' || variable.includes('TITLE');
                            
                            // Obtener etiqueta amigable según tipo de variable
                            const getReadableLabel = () => {
                              // Determinar la etiqueta según el tipo y contenido variable
                              if (variableType === 'title' || isTitle) return 'Título principal';
                              
                              // Mejorar etiquetas para párrafos mostrando el número
                              if (variable.startsWith('PARAGRAPH_')) {
                                const paragraphNum = variable.split('_')[1];
                                return `Párrafo ${paragraphNum || ''}`;
                              }
                              
                              if (variableType === 'text' || variable.includes('TEXT')) {
                                // Detectar si es un párrafo largo o una etiqueta corta
                                const textContent = variableValue || '';
                                if (textContent.length > 60) return 'Párrafo de texto';
                                if (textContent.length < 20) return 'Etiqueta';
                                return 'Texto';
                              }
                              if (variableType === 'image' || variable.includes('IMG_SRC')) {
                                // Añadir número de imagen para multiples imagenes
                                const imgNum = variable.split('_')[2];
                                return `URL de imagen ${imgNum || ''}`;
                              }
                              if (variableType === 'attribute' || variable.includes('IMG_ALT')) return 'Texto alternativo';
                              if (isStart) return `URL del enlace ${pairNumber}`;
                              if (isEnd) return `Texto del botón ${pairNumber}`;
                              
                              // Devolver versión legible del nombre variable en español
                              return variable.replace(/_/g, ' ').toLowerCase()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                            };
                            
                            return (
                              <div 
                                key={variableKey} 
                                className={`${styles.variableInput} ${
                                  isTitle ? styles.titleInput : ''
                                } ${
                                  isStart ? styles.pairStart : 
                                  isEnd ? styles.pairEnd : ''
                                }`}
                              >
                                {/* Añadir conector visual entre elementos del par */}
                                {isStart && <div className={styles.pairConnector} />}

                                <label>{getReadableLabel()}</label>
                                
                                {variableType === 'image' && (
                                  <ImageVariableInput 
                                    id={variableKey}
                                    value={variableValue} 
                                    onChange={handleChange}
                                  />
                                )}
                                
                                {variableType === 'link' && (
                                  <LinkVariableInput 
                                    id={variableKey}
                                    value={variableValue} 
                                    onChange={handleChange}
                                  />
                                )}
                                
                                {variableType === 'title' && (
                                  <TextVariableInput 
                                    id={variableKey}
                                    value={variableValue} 
                                    onChange={handleChange}
                                    multiline={true}
                                    placeholder="Escribe el título principal"
                                  />
                                )}
                                
                                {variableType === 'text' && (
                                  <TextVariableInput 
                                    id={variableKey}
                                    value={variableValue} 
                                    onChange={handleChange}
                                    multiline={variableValue.length > 40}
                                    placeholder={`Escribe el texto aquí`}
                                  />
                                )}
                                
                                {variableType === 'attribute' && (
                                  <TextVariableInput 
                                    id={variableKey}
                                    value={variableValue} 
                                    onChange={handleChange}
                                  />
                                )}
                                
                                {/* Manejo específico para el texto del botón */}
                                {variableType === 'button' && (
                                  <TextVariableInput 
                                    id={variableKey}
                                    value={variableValue} 
                                    onChange={handleChange}
                                    placeholder="Escribe el texto del botón"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  })()}
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
