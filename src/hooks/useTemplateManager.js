import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing template loading and management
 */
export const useTemplateManager = (variableHook) => {
  const [selectedHeader, setSelectedHeader] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedFooter, setSelectedFooter] = useState('');
  const [templateMaster, setTemplateMaster] = useState('');
  const [availableHeaders, setAvailableHeaders] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [availableFooters, setAvailableFooters] = useState([]);
  const [headerContent, setHeaderContent] = useState('');
  const [sectionContents, setSectionContents] = useState({});
  const [footerContent, setFooterContent] = useState('');
  const [templatesLoading, setTemplatesLoading] = useState(true);

  const {
    extractVariables,
    categorizeTemplateVariables,
    setCategorizedVariables,
    setHeaderVariables,
    setSectionVariables,
    setFooterVariables,
    initializeVariableValues
  } = variableHook;

  // Function to fetch a specific template
  const fetchTemplate = useCallback(async (type, name) => {
    try {
      const response = await fetch(`/emails/${type}/${name}.html`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();

      // Extract variables from the template
      const variables = extractVariables(content, type);

      // Update the corresponding variables state
      if (type === 'headers') {
        setHeaderVariables(prev => ({ ...prev, [name]: variables }));
        
        // Categorize variables for this header
        const categorized = categorizeTemplateVariables(variables, type, name);
        setCategorizedVariables(prev => ({
          ...prev,
          header: { ...prev.header, [name]: categorized }
        }));
      } else if (type === 'sections') {
        setSectionVariables(prev => ({ ...prev, [name]: variables }));
        
        // Categorize variables for this section
        const categorized = categorizeTemplateVariables(variables, type, name);
        setCategorizedVariables(prev => ({
          ...prev,
          section: { ...prev.section, [name]: categorized }
        }));
      } else if (type === 'footers') {
        setFooterVariables(prev => ({ ...prev, [name]: variables }));
        
        // Categorize variables for this footer
        const categorized = categorizeTemplateVariables(variables, type, name);
        setCategorizedVariables(prev => ({
          ...prev,
          footer: { ...prev.footer, [name]: categorized }
        }));
      }

      // Initialize variable values with defaults
      initializeVariableValues(variables, type, name);

      return content; // Return the fetched HTML content

    } catch (error) {
      console.error(`Error in fetchTemplate for ${type}/${name}.html:`, error);
      const errorMessage = `
      <div style="color: red; border: 1px solid red; padding: 10px; margin: 5px; font-family: sans-serif;">
        <strong>Error loading template:</strong> ${type}/${name}.html<br>
        <strong>Detail:</strong> ${error.message}<br>
        Please verify that the file exists in the <code>public/emails/${type}/</code> folder and that the development server is running correctly.
      </div>`;
      return errorMessage;
    }
  }, [extractVariables, categorizeTemplateVariables, setCategorizedVariables, setHeaderVariables, setSectionVariables, setFooterVariables, initializeVariableValues]);

  // Function to load the master template
  const loadMasterTemplate = useCallback(async () => {
    try {
      // Load the master template from file
      const response = await fetch('/emails/template-maestro.html');
      if (!response.ok) {
        throw new Error('Could not load master template');
      }
      const masterTemplate = await response.text();
      setTemplateMaster(masterTemplate);
    } catch (error) {
      console.error('Error loading master template:', error);
      // Fallback template in case of error
      const fallbackTemplate = `<div class="email-container">
%%HEADER%%
%%SECTIONS%%
%%FOOTER%%
</div>`;
      setTemplateMaster(fallbackTemplate);
    }
  }, []);

  // Function to load all selected sections
  const loadAllSections = useCallback(async () => {
    const newSectionContents = {};

    // Load each selected section
    for (const section of selectedSections) {
      const content = await fetchTemplate('sections', section);
      newSectionContents[section] = content;
    }

    setSectionContents(newSectionContents);
  }, [selectedSections, fetchTemplate]);

  // Function to fetch available templates from API
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

        // Set initial values if templates are available
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
      console.error('Error fetching templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  }, [selectedHeader, selectedSections, selectedFooter]);

  // Load master template and available templates on component mount
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

  return {
    // State
    selectedHeader,
    selectedSections,
    selectedFooter,
    templateMaster,
    availableHeaders,
    availableSections,
    availableFooters,
    headerContent,
    sectionContents,
    footerContent,
    templatesLoading,
    
    // Setters
    setSelectedHeader,
    setSelectedSections,
    setSelectedFooter,
    
    // Functions
    fetchTemplate,
    loadMasterTemplate,
    loadAllSections,
    fetchAvailableTemplates
  };
};
