'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

// Importar componentes
import HeaderEditor from '../components/HeaderEditor';
import SectionEditor from '../components/SectionEditor';
import FooterEditor from '../components/FooterEditor';
import EmailPreview from '../components/EmailPreview';

// Importar utilidades
import { replaceTemplateVariables } from '../utils/templateUtils';

export default function Home() {
  // State variables
  const [selectedHeader, setSelectedHeader] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedFooter, setSelectedFooter] = useState('');
  const [emailHTML, setEmailHTML] = useState('');
  const [templateMaster, setTemplateMaster] = useState('');
  const [availableHeaders, setAvailableHeaders] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [availableFooters, setAvailableFooters] = useState([]);
  const [headerContent, setHeaderContent] = useState('');
  const [sectionContents, setSectionContents] = useState({});
  const [footerContent, setFooterContent] = useState('');
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Variables states for templates
  const [headerVariables, setHeaderVariables] = useState({});
  const [sectionVariables, setSectionVariables] = useState({});
  const [footerVariables, setFooterVariables] = useState({});
  const [variableValues, setVariableValues] = useState({});
  const [categorizedVariables, setCategorizedVariables] = useState({
    header: {},
    section: {},
    footer: {}
  });

  // Categoriza el tipo de variable
  const categorizeVariable = useCallback((variableName) => {
    // Variables por atributos personalizados
    if (variableName.startsWith('LABEL_')) return 'label';
    if (variableName.startsWith('TITLE_')) return 'title';

    // Variables de imagen
    if (variableName.startsWith('IMG_SRC_')) return 'image';
    if (variableName.startsWith('IMG_ALT_')) return 'attribute';
    if (variableName.startsWith('IMG_TITLE_')) return 'attribute';

    // Enlaces y botones
    if (variableName.startsWith('BUTTON_LINK_')) return 'link';
    if (variableName.startsWith('BUTTON_TEXT_')) return 'button';
    if (variableName.startsWith('LINK_URL_')) return 'link';

    // Párrafos
    if (variableName.startsWith('PARAGRAPH_')) return 'text';

    // Por defecto para compatibilidad con versiones anteriores
    if (variableName.startsWith('LINK_PAIR_')) return 'link';
    if (variableName.startsWith('BUTTON_PAIR_')) return 'button';
    if (variableName.startsWith('LINK_')) return 'link';

    // Si contiene palabras clave específicas
    if (variableName.includes('IMG_SRC')) return 'image';
    if (variableName.includes('LINK') || variableName.includes('URL') || variableName.includes('HREF')) return 'link';
    if (variableName.includes('BUTTON')) return 'text';

    return 'text';
  }, []);

  // Function to categorize all variables from a template
  const categorizeTemplateVariables = useCallback((variables, type, name) => {
    const categorized = {
      images: [],
      links: [],
      attributes: [],
      texts: []
    };

    variables.forEach(variable => {
      const category = categorizeVariable(variable);
      switch (category) {
        case 'image':
          categorized.images.push(variable);
          break;
        case 'link':
          categorized.links.push(variable);
          break;
        case 'attribute':
          categorized.attributes.push(variable);
          break;
        case 'text':
          categorized.texts.push(variable);
          break;
      }
    });

    return categorized;
  }, [categorizeVariable]);

  // Function to check if a variable is likely to be an image URL (mantained for compatibility)
  const isImageVariable = useCallback((variableName) => {
    return categorizeVariable(variableName) === 'image';
  }, [categorizeVariable]);

  // Function to extract variables from template content
  const extractVariables = useCallback((content, type = null) => {
    if (type === 'sections') {
      // Para secciones, extraemos contenido editable usando atributos data-variable y data-variable
      const variables = [];
      const orderedElementsMap = new Map(); // Mapa para almacenar elementos y sus posiciones

      // Contadores para diferentes tipos de elementos
      let labelCounter = 1;
      let titleCounter = 1;
      let imgCounter = 1;
      let paragraphCounter = 1;
      let buttonCounter = 1;
      let linkCounter = 1;

      // 1. Detectar elementos con el atributo data-variable="LABEL"
      const labelRegex = /<td[^>]*data-variable="LABEL"[^>]*>([\s\S]*?)<\/td>/g;
      let labelMatch;

      while ((labelMatch = labelRegex.exec(content)) !== null) {
        const position = labelMatch.index;
        // Extraer el texto del label (eliminando tags HTML internos)
        const labelText = labelMatch[1].replace(/<[^>]*>/g, '').trim();

        if (labelText.length > 0) {
          orderedElementsMap.set(`LABEL_${labelCounter}`, {
            type: 'label',
            position: position,
            value: labelText
          });
          labelCounter++;
        }
      }

      // 2. Detectar elementos con el atributo data-variable="TITLE"
      const titleRegex = /<td[^>]*data-variable="TITLE"[^>]*>([\s\S]*?)<\/td>/g;
      let titleMatch;

      while ((titleMatch = titleRegex.exec(content)) !== null) {
        const position = titleMatch.index;
        const rawTitle = titleMatch[1];

        // Guardamos el HTML completo para mantener <br> y <span>
        // El usuario podrá editar estos elementos usando etiquetas HTML
        if (rawTitle.trim().length > 0) {
          orderedElementsMap.set(`TITLE_${titleCounter}`, {
            type: 'title',
            position: position,
            value: rawTitle.trim(),
            isHTML: true // Indicamos que el contenido es HTML para procesar correctamente
          });
          titleCounter++;
        }
      }

      // 3. Detectar elementos con el atributo data-variable="IMG"
      const imgRegex = /<img[^>]*data-variable="IMG"[^>]*>/g;
      let imgMatch;

      while ((imgMatch = imgRegex.exec(content)) !== null) {
        const position = imgMatch.index;
        const imgTag = imgMatch[0];

        // Extraer src, alt y title de la imagen
        const srcMatch = /src="([^"]+)"/.exec(imgTag);
        if (srcMatch) {
          orderedElementsMap.set(`IMG_SRC_${imgCounter}`, {
            type: 'image',
            position: position,
            value: srcMatch[1]
          });
        }

        const altMatch = /alt="([^"]+)"/.exec(imgTag);
        if (altMatch) {
          orderedElementsMap.set(`IMG_ALT_${imgCounter}`, {
            type: 'attribute',
            position: position + 1,
            value: altMatch[1]
          });
        }

        const titleMatch = /title="([^"]+)"/.exec(imgTag);
        if (titleMatch) {
          orderedElementsMap.set(`IMG_TITLE_${imgCounter}`, {
            type: 'attribute',
            position: position + 2,
            value: titleMatch[1]
          });
        }

        imgCounter++;
      }

      // 4. Detectar elementos con el atributo data-variable="PARAGRAPH" (notar el typo en "varoable")
      const paragraphRegex = /<td[^>]*data-variable="PARAGRAPH"[^>]*>([\s\S]*?)<\/td>/g;
      let paragraphMatch;

      while ((paragraphMatch = paragraphRegex.exec(content)) !== null) {
        const position = paragraphMatch.index;
        const paragraphContent = paragraphMatch[1];

        if (paragraphContent.trim().length > 0) {
          orderedElementsMap.set(`PARAGRAPH_${paragraphCounter}`, {
            type: 'text',
            position: position,
            value: paragraphContent.trim(),
            isHTML: true // Para mantener posible formato HTML
          });
          paragraphCounter++;
        }
      }

      // 5. Detectar elementos con el atributo data-variable="BUTTON" (notar el typo en "varoable")
      const buttonRegex = /<a[^>]*data-variable="BUTTON"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
      let buttonMatch;

      while ((buttonMatch = buttonRegex.exec(content)) !== null) {
        const href = buttonMatch[1];
        const buttonText = buttonMatch[2].replace(/<[^>]*>/g, '').trim();
        const position = buttonMatch.index;

        if (href && buttonText.length > 0) {
          orderedElementsMap.set(`BUTTON_LINK_${buttonCounter}`, {
            type: 'link',
            position: position,
            value: href
          });

          orderedElementsMap.set(`BUTTON_TEXT_${buttonCounter}`, {
            type: 'button',
            position: position + 1,
            value: buttonText
          });

          buttonCounter++;
        }
      }

      // 6. Detectar elementos con el atributo data-variable="LINK" (notar el typo en "varoable")
      const linkRegex = /<a[^>]*data-variable="LINK"[^>]*href="([^"]+)"[^>]*>/g;
      let linkMatch;

      while ((linkMatch = linkRegex.exec(content)) !== null) {
        const href = linkMatch[1];
        const position = linkMatch.index;

        if (href && href !== '#' && href !== '') {
          orderedElementsMap.set(`LINK_URL_${linkCounter}`, {
            type: 'link',
            position: position,
            value: href
          });
          linkCounter++;
        }
      }

      // Convertir el mapa a un array ordenado y extraer las claves
      const elementArray = Array.from(orderedElementsMap.entries())
        .sort((a, b) => a[1].position - b[1].position)
        .map(item => item[0]);

      // Construir objeto con valores predeterminados para inicializar valores de estado
      const templateDefaultValues = {};
      orderedElementsMap.forEach((data, key) => {
        templateDefaultValues[key] = data.value;
        // También guardar con formato section_[name]_0_[variable] para compatibilidad
        const sectionKey = `section_${name}_0_${key}`;
        templateDefaultValues[sectionKey] = data.value;
        console.log(`Extrayendo valor predeterminado: ${key} = "${data.value}" (también como ${sectionKey})`);
      });

      return elementArray;
    } else {
      // Para headers y footers, extraemos variables tradicionales
      const variables = [];
      const pattern = /%%([A-Z_0-9]+)%%/g;
      let match;

      while ((match = pattern.exec(content)) !== null) {
        variables.push(match[1]);
      }

      return variables;
    }
  }, []);

  // Function to fetch an HTML template
  const fetchTemplate = useCallback(async (type, name) => {
    try {
      // Construct the path to the HTML template dynamically
      const filePath = `/emails/${type}/${name}.html`;
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`No se pudo cargar la plantilla: ${filePath}. Status: ${response.status}`);
      }
      const content = await response.text();
      const variables = extractVariables(content, type);

      // Categorizar las variables por tipo para la UI
      const categorized = categorizeTemplateVariables(variables);

      // Actualizar variables categorizadas
      setCategorizedVariables(prev => {
        const singularType = type.endsWith('s') ? type.slice(0, -1) : type; // headers -> header
        return {
          ...prev,
          [singularType]: {
            ...prev[singularType],
            [name]: categorized
          }
        };
      });

      // Update type-specific variables state (e.g., setHeaderVariables)
      if (type === 'headers') {
        setHeaderVariables(prev => ({ ...prev, [name]: variables }));
      } else if (type === 'sections') {
        setSectionVariables(prev => ({ ...prev, [name]: variables }));
      } else if (type === 'footers') {
        setFooterVariables(prev => ({ ...prev, [name]: variables }));
      }

      // Initialize variableValues with defaults if necessary
      setVariableValues(prev => {
        const newValues = { ...prev };
        let templateDefaultValues = {};

        // Define default values based on type and name
        // This preserves the specific defaults for header1.html and footer1.html
        if (type === 'headers' && name === 'header1') {
          templateDefaultValues = {
            'LOGO_SRC': 'https://files.kzsoftworks.com/newsletters/2024/EmailImages/logo_ont7le.png',
            'LOGO_ALT': 'Kaizen Softworks Logo',
            'LOGO_TITLE': 'Kaizen Softworks'
            // Add other defaults for header1.html if its variables change
          };
        } else if (type === 'footers' && name === 'footer1') {
          templateDefaultValues = {
            'LOGO_LINK': 'https://www.kzsoftworks.com/',
            'LOGO_SRC': 'https://files.kzsoftworks.com/newsletters/2024/EmailImages/logo_ont7le.png',
            'LOGO_ALT': 'Kaizen Softworks Logo',
            'LOGO_TITLE': 'Kaizen Softworks',
            'LINKEDIN_LINK': 'https://www.linkedin.com/company/kaizen-softworks/',
            'LINKEDIN_IMG': 'https://files.kzsoftworks.com/newsletters/2024/EmailImages/linkedin.png',
            'LINKEDIN_ALT': 'LinkedIn logo',
            'LINKEDIN_TITLE': 'LinkedIn',
            'INSTAGRAM_LINK': 'https://www.instagram.com/kzsoftworks/',
            'INSTAGRAM_IMG': 'https://files.kzsoftworks.com/newsletters/2024/EmailImages/instagram.png',
            'INSTAGRAM_ALT': 'Instagram logo',
            'INSTAGRAM_TITLE': 'Instagram',
            'FACEBOOK_LINK': 'https://www.facebook.com/kzsoftworks',
            'FACEBOOK_IMG': 'https://files.kzsoftworks.com/newsletters/2024/EmailImages/facebook.png',
            'FACEBOOK_ALT': 'Facebook logo',
            'FACEBOOK_TITLE': 'Facebook',
            'BEHANCE_LINK': 'https://www.behance.net/kaizensoftworks/',
            'BEHANCE_IMG': 'https://files.kzsoftworks.com/newsletters/2024/EmailImages/behance.png',
            'BEHANCE_ALT': 'Behance logo',
            'BEHANCE_TITLE': 'Behance',
            'DRIBBBLE_LINK': 'https://dribbble.com/kaizensoftworks',
            'DRIBBBLE_IMG': 'https://files.kzsoftworks.com/newsletters/2024/EmailImages/dribbble.png',
            'DRIBBBLE_ALT': 'Dribble logo',
            'DRIBBBLE_TITLE': 'Dribble',
            'FIGMA_LINK': 'https://www.figma.com/@kaizensoftworks',
            'FIGMA_IMG': 'https://files.kzsoftworks.com/newsletters/2024/EmailImages/figma_nemgvl.png',
            'FIGMA_ALT': 'Figma logo',
            'FIGMA_TITLE': 'Figma'
            // Add other defaults for footer1.html if its variables change
          };
        }
        // Add more generic defaults here if needed, e.g.
        // templateDefaultValues['YEAR'] = templateDefaultValues['YEAR'] || new Date().getFullYear().toString();

        variables.forEach(variable => {
          // Para secciones, usar el formato que espera el componente SectionEditor
          let valueKey;
          if (type === 'sections') {
            // El índice será 0 para la carga inicial, pero se actualizará al renderizar el componente
            valueKey = `section_${name}_0_${variable}`;
            
            // Verificamos ambos formatos de clave para obtener el valor predeterminado
            // Primero la clave específica de sección, luego la clave genérica
            if (templateDefaultValues[valueKey]) {
              newValues[valueKey] = templateDefaultValues[valueKey];
              console.log(`✅ Inicializando (clave específica) ${valueKey} con valor: "${newValues[valueKey]}"`);
            } else if (templateDefaultValues[variable]) {
              newValues[valueKey] = templateDefaultValues[variable];
              console.log(`✅ Inicializando (clave genérica) ${valueKey} con valor: "${templateDefaultValues[variable]}"`);
            } else {
              newValues[valueKey] = '';
              console.log(`❌ No se encontró valor predeterminado para ${valueKey}`);
            }
          } else {
            valueKey = `${type}_${name}_${variable}`;
            newValues[valueKey] = templateDefaultValues[variable] || '';
            console.log(`Inicializando ${valueKey} con valor: "${newValues[valueKey]}"`);
          }
        });
        return newValues;
      });

      return content; // Return the fetched HTML content

    } catch (error) {
      console.error(`Error en fetchTemplate para ${type}/${name}.html:`, error);
      const errorMessage = `
      <div style="color: red; border: 1px solid red; padding: 10px; margin: 5px; font-family: sans-serif;">
        <strong>Error al cargar plantilla:</strong> ${type}/${name}.html<br>
        <strong>Detalle:</strong> ${error.message}<br>
        Por favor, verifique que el archivo exista en la carpeta <code>public/emails/${type}/</code> y que el servidor de desarrollo esté funcionando correctamente.
      </div>`;
      return errorMessage;
    }
  }, [extractVariables, categorizeTemplateVariables, setCategorizedVariables, setHeaderVariables, setSectionVariables, setFooterVariables, setVariableValues]);

  // Función para cargar la plantilla maestra
  const loadMasterTemplate = useCallback(async () => {
    try {
      // Cargar la plantilla maestra desde el archivo
      const response = await fetch('/emails/template-maestro.html');
      if (!response.ok) {
        throw new Error('No se pudo cargar la plantilla maestra');
      }
      const masterTemplate = await response.text();
      setTemplateMaster(masterTemplate);
    } catch (error) {
      console.error('Error cargando plantilla maestra:', error);
      // Plantilla de respaldo en caso de error
      const fallbackTemplate = `<div class="email-container">
%%HEADER%%
%%SECTIONS%%
%%FOOTER%%
</div>`;
      setTemplateMaster(fallbackTemplate);
    }
  }, []);

  // Función para cargar todas las secciones seleccionadas
  const loadAllSections = useCallback(async () => {
    const newSectionContents = {};

    // Cargar cada sección seleccionada
    for (const section of selectedSections) {
      const content = await fetchTemplate('sections', section);
      newSectionContents[section] = content;
    }

    setSectionContents(newSectionContents);
  }, [selectedSections, fetchTemplate, setSectionContents]);

  // Función para cargar templates disponibles desde la API
  const fetchAvailableTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const headersResponse = await fetch('/api/list-templates?type=headers');
      const sectionsResponse = await fetch('/api/list-templates?type=sections');
      const footersResponse = await fetch('/api/list-templates?type=footers');

      if (headersResponse.ok && sectionsResponse.ok && footersResponse.ok) {
        const headers = await headersResponse.json();
        const sections = await sectionsResponse.json();
        const footers = await footersResponse.json();

        setAvailableHeaders(headers);
        setAvailableSections(sections);
        setAvailableFooters(footers);

        // Establecer valores iniciales si hay templates disponibles
        if (headers.length > 0 && !selectedHeader) {
          setSelectedHeader(headers[0]);
        }

        if (sections.length > 0 && selectedSections.length === 0) {
          setSelectedSections([sections[0]]);
        }

        if (footers.length > 0 && !selectedFooter) {
          setSelectedFooter(footers[0]);
        }
      }
    } catch (error) {
      console.error('Error obteniendo templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  }, [selectedHeader, selectedSections, selectedFooter]);

  // Cargar la plantilla maestra y los templates disponibles al iniciar la aplicación
  useEffect(() => {
    loadMasterTemplate();
    fetchAvailableTemplates();
  }, [loadMasterTemplate, fetchAvailableTemplates]);

  // Load header template when selected header changes
  useEffect(() => {
    const loadHeader = async () => {
      if (selectedHeader) {
        const content = await fetchTemplate('headers', selectedHeader);
        setHeaderContent(content);
      }
    };

    loadHeader();
  }, [selectedHeader, fetchTemplate]);

  // Load section templates when selected sections change
  useEffect(() => {
    if (selectedSections.length > 0) {
      loadAllSections();
    } else {
      setSectionContents({});
    }
    // Incluimos loadAllSections en las dependencias para evitar warnings del linter
  }, [selectedSections, loadAllSections]);

  // Load footer template when selected footer changes
  useEffect(() => {
    const loadFooter = async () => {
      if (selectedFooter) {
        const content = await fetchTemplate('footers', selectedFooter);
        setFooterContent(content);
      }
    };

    loadFooter();
  }, [selectedFooter, fetchTemplate]);

  // Función para generar el HTML del email
  const generateEmailHTML = useCallback(() => {
    if (!templateMaster || !headerContent || !footerContent) return '';

    try {
      // Replace variables in header
      const processedHeader = replaceTemplateVariables(headerContent, 'header', selectedHeader, variableValues);

      // Envolver el header en la estructura de tabla requerida
      const wrappedHeader = `<tr>
      <td align="center" style="background-color:#181f47;">
        ${processedHeader.replace(/<custom type="content" name="contentarea1">/, '')}
      </td>
    </tr>`;

      // Process each section with its variables
      const sectionsHTML = selectedSections
        .map((section, index) => {
          const sectionContent = sectionContents[section] || '';
          if (!sectionContent) return '';
          const processedContent = replaceTemplateVariables(sectionContent, 'sections', section, variableValues, sectionVariables, index);

          // Envolver cada sección en la estructura de tabla requerida
          return `<tr>
          <td align="center" style="background-color:#181f47;">
            ${processedContent.replace(/<custom type="content" name="contentarea1">/, '')}
          </td>
        </tr>`;
        })
        .join('');

      // Replace variables in footer
      const processedFooter = replaceTemplateVariables(footerContent, 'footer', selectedFooter, variableValues);
      // Envolver el footer en la estructura de tabla requerida
      const wrappedFooter = `<tr>
      <td align="center" style="background-color:#181f47;">
        ${processedFooter.replace(/<custom type="content" name="contentarea1">/, '')}
      </td>
    </tr>`;

      // Replace placeholders in the master template
      return templateMaster
        .replace('%%HEADER%%', wrappedHeader)
        .replace('%%SECTIONS%%', sectionsHTML)
        .replace('%%FOOTER%%', wrappedFooter);
    } catch (error) {
      console.error('Error generando el HTML del email:', error);
      return '';
    }
  }, [
    templateMaster,
    headerContent,
    footerContent,
    sectionContents,
    selectedSections,
    selectedHeader,
    selectedFooter,
    variableValues,
    sectionVariables
  ]);

  // Efecto único para actualizar la vista previa cuando cambia cualquier dependencia relevante
  useEffect(() => {
    if (templateMaster && headerContent && footerContent) {
      console.log('Actualizando preview con valores:', variableValues);
      const newHTML = generateEmailHTML();
      setEmailHTML(newHTML);
    }
  }, [generateEmailHTML, templateMaster, headerContent, footerContent, variableValues]);
  
  // Efecto para crear y limpiar la función global updateEmailPreview
  useEffect(() => {
    // Crear una función global para que los componentes hijos puedan actualizar el HTML
    window.updateEmailPreview = () => {
      if (templateMaster && headerContent && footerContent) {
        const newHTML = generateEmailHTML();
        setEmailHTML(newHTML);
        console.log('updateEmailPreview llamado, valores actuales:', variableValues);
      }
    };

    // Limpiar la función global cuando el componente se desmonte
    return () => {
      window.updateEmailPreview = undefined;
    };
  }, [templateMaster, headerContent, footerContent, variableValues, generateEmailHTML]);

  // No necesitamos este efecto ya que estaría duplicado
  // El efecto anterior ya se encarga de actualizar cuando cambian las variables

  // Add a new section
  const addSection = () => {
    setSelectedSections([...selectedSections, 'section1']);
  };

  // Remove a section
  const removeSection = (index) => {
    const newSections = [...selectedSections];
    newSections.splice(index, 1);
    setSelectedSections(newSections);
  };

  // Change a specific section
  const changeSection = (index, value) => {
    const newSections = [...selectedSections];
    newSections[index] = value;
    setSelectedSections(newSections);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Constructor de Emails</h1>
        <p>Seleccione los componentes para construir su email</p>
      </header>

      <div className={styles.builderContainer}>
        <div className={styles.controlsPanel}>
          {/* Componente para el encabezado */}
          <HeaderEditor
            selectedHeader={selectedHeader}
            availableHeaders={availableHeaders}
            setSelectedHeader={setSelectedHeader}
            headerVariables={headerVariables}
            variableValues={variableValues}
            setVariableValues={setVariableValues}
            isImageVariable={isImageVariable}
            categorizedVariables={categorizedVariables}
          />

          {/* Componente para las secciones */}
          <SectionEditor
            selectedSections={selectedSections}
            availableSections={availableSections}
            addSection={addSection}
            removeSection={removeSection}
            changeSection={changeSection}
            sectionVariables={sectionVariables}
            variableValues={variableValues}
            setVariableValues={setVariableValues}
            isImageVariable={isImageVariable}
            categorizedVariables={categorizedVariables}
            categorizeVariable={categorizeVariable}
          />

          {/* Componente para el pie de página */}
          <FooterEditor
            selectedFooter={selectedFooter}
            availableFooters={availableFooters}
            setSelectedFooter={setSelectedFooter}
            footerVariables={footerVariables}
            variableValues={variableValues}
            setVariableValues={setVariableValues}
            isImageVariable={isImageVariable}
            categorizedVariables={categorizedVariables}
          />
        </div>

        {/* Componente para la vista previa del email */}
        <EmailPreview emailHTML={emailHTML} />
      </div>
    </div>
  );
};
