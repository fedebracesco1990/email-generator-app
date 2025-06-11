'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

// Importar componentes
import HeaderEditor from '../components/HeaderEditor';
import SectionEditor from '../components/SectionEditor';
import FooterEditor from '../components/FooterEditor';
import EmailPreview from '../components/EmailPreview';

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

  // Function to check variable type
  const categorizeVariable = useCallback((variableName) => {
    // Clasificar variables según su nombre
    if (variableName.includes('SRC') || variableName.includes('IMG')) {
      return 'image';
    } else if (variableName.includes('LINK') || variableName.includes('URL') || variableName.includes('HREF')) {
      return 'link';
    } else if (variableName.includes('ALT') || variableName.includes('TITLE')) {
      return 'attribute';
    } else {
      return 'text';
    }
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
  const extractVariables = useCallback((content) => {
    const regex = /%%([A-Z_]+)%%/g;
    const variables = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
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
    const variables = extractVariables(content);
    
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
        const valueKey = `${type}_${name}_${variable}`;
        if (!newValues[valueKey]) { // Initialize if not already set or if it's an empty string
          newValues[valueKey] = templateDefaultValues[variable] || ''; 
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

  // Función mejorada para reemplazar variables en plantillas HTML
  const replaceTemplateVariables = useCallback((template, type, name, sectionIndex = null) => {
    if (!template) return '';
    
    // Crear una copia del template para trabajar
    let result = template;
    
    // Primer paso: reemplazar variables de imágenes directamente en atributos src
    result = result.replace(/<img([^>]*)src="%%([A-Z_]+)%%"([^>]*)>/g, (match, before, varName, after) => {
      // Para secciones usamos el índice, para otros componentes no
      const key = type === 'section' 
        ? `${type}_${name}_${sectionIndex}_${varName}` 
        : `${type}_${name}_${varName}`;
      const imgUrl = variableValues[key] || '';
      if (imgUrl) {
        return `<img${before}src="${imgUrl}"${after}>`;
      } else {
        // Si no hay URL, poner una imagen transparente
        return `<img${before}src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="${after}>`;
      }
    });
    
    // Segundo paso: reemplazar otras variables (textos, alt, etc.)
    const regex = /%%([A-Z_]+)%%/g;
    result = result.replace(regex, (match, variableName) => {
      // Para secciones usamos el índice, para otros componentes no
      const key = type === 'section' 
        ? `${type}_${name}_${sectionIndex}_${variableName}` 
        : `${type}_${name}_${variableName}`;
      return variableValues[key] || '';
    });
    
    return result;
  }, [variableValues]);

  // Función para generar el HTML del email
  const generateEmailHTML = useCallback(() => {
    if (!templateMaster || !headerContent || !footerContent) return '';
    
    try {
      // Replace variables in header
      const processedHeader = replaceTemplateVariables(headerContent, 'header', selectedHeader);
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
          const processedContent = replaceTemplateVariables(sectionContent, 'section', section, index);
          
          // Envolver cada sección en la estructura de tabla requerida
          return `<tr>
            <td align="center" style="background-color:#181f47;">
              ${processedContent.replace(/<custom type="content" name="contentarea1">/, '')}
            </td>
          </tr>`;
        })
        .join('');
      
      // Replace variables in footer
      const processedFooter = replaceTemplateVariables(footerContent, 'footer', selectedFooter);
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
    replaceTemplateVariables
  ]);
  
  // Efecto único para actualizar la vista previa cuando cambia cualquier dependencia relevante
  useEffect(() => {
    // Solo actualizamos cuando se cargan las plantillas inicialmente
    if (templateMaster && headerContent && footerContent) {
      const newHTML = generateEmailHTML();
      setEmailHTML(newHTML);
    }
    
    // Crear una función global para que los componentes hijos puedan actualizar el HTML
    window.updateEmailPreview = () => {
      if (templateMaster && headerContent && footerContent) {
        const newHTML = generateEmailHTML();
        setEmailHTML(newHTML);
      }
    };
    
    // Limpiar la función global cuando el componente se desmonte
    return () => {
      window.updateEmailPreview = undefined;
    };
  }, [templateMaster, headerContent, footerContent, variableValues, generateEmailHTML]); // Dependencias más simples y estables

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
  
  // No necesitamos esta función ya que usaremos campos de texto para URLs
  // en lugar de selectores de archivos para imágenes

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
}
