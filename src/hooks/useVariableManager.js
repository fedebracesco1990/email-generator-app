import { useState, useCallback } from 'react';

/**
 * Custom hook for managing template variables and their categorization
 */
export const useVariableManager = () => {
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

  // Function to categorize variable by type
  const categorizeVariable = useCallback((variableName) => {
    // New categorization based on data-variable prefixes
    if (variableName.startsWith('LABEL_')) {
      return 'text';
    } else if (variableName.startsWith('TITLE_')) {
      return 'text';
    } else if (variableName.startsWith('IMG_SRC_')) {
      return 'image';
    } else if (variableName.startsWith('IMG_ALT_') || variableName.startsWith('IMG_TITLE_')) {
      return 'attribute';
    } else if (variableName.startsWith('PARAGRAPH_')) {
      return 'text';
    } else if (variableName.startsWith('BUTTON_HREF_') || variableName.startsWith('LINK_HREF_')) {
      return 'link';
    } else if (variableName.startsWith('BUTTON_TEXT_')) {
      return 'text';
    } else {
      // Fallback for %%VARIABLE%% format (headers/footers)
      if (variableName.includes('SRC') || variableName.includes('IMG_SRC')) {
        return 'image';
      } else if (variableName.includes('LINK') || variableName.includes('URL') || variableName.includes('HREF')) {
        return 'link';
      } else if (variableName.includes('ALT') || variableName.includes('TITLE') || variableName.includes('IMG_ALT')) {
        return 'attribute';
      } else {
        return 'text';
      }
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

  // Function to check if a variable is likely to be an image URL
  const isImageVariable = useCallback((variableName) => {
    return categorizeVariable(variableName) === 'image';
  }, [categorizeVariable]);

  // Function to extract variables from template content
  const extractVariables = useCallback((content, type = null) => {
    if (type === 'sections') {
      // For sections, extract variables based on data-variable attributes in DOM order
      const variables = [];
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // Find all elements with data-variable attribute
      const elementsWithVariables = doc.querySelectorAll('[data-variable]');
      
      // Convert NodeList to Array to maintain DOM order
      const orderedElements = Array.from(elementsWithVariables);
      
      // Track counters for each variable type
      const counters = {
        LABEL: 1,
        TITLE: 1,
        IMG: 1,
        PARAGRAPH: 1,
        BUTTON: 1,
        LINK: 1
      };
      
      // Process elements in DOM order
      orderedElements.forEach((element) => {
        const variableType = element.getAttribute('data-variable');
        
        switch (variableType) {
          case 'LABEL':
            variables.push(`LABEL_${counters.LABEL}`);
            counters.LABEL++;
            break;
            
          case 'TITLE':
            variables.push(`TITLE_${counters.TITLE}`);
            counters.TITLE++;
            break;
            
          case 'IMG':
            // For images, extract src, alt, and title in sequence
            variables.push(`IMG_SRC_${counters.IMG}`);
            if (element.getAttribute('alt')) {
              variables.push(`IMG_ALT_${counters.IMG}`);
            }
            if (element.getAttribute('title')) {
              variables.push(`IMG_TITLE_${counters.IMG}`);
            }
            counters.IMG++;
            break;
            
          case 'PARAGRAPH':
            variables.push(`PARAGRAPH_${counters.PARAGRAPH}`);
            counters.PARAGRAPH++;
            break;
            
          case 'BUTTON':
            // For buttons, extract href and text in sequence
            variables.push(`BUTTON_HREF_${counters.BUTTON}`);
            variables.push(`BUTTON_TEXT_${counters.BUTTON}`);
            counters.BUTTON++;
            break;
            
          case 'LINK':
            // For links, extract only href
            variables.push(`LINK_HREF_${counters.LINK}`);
            counters.LINK++;
            break;
        }
      });

      return variables;
    } else {
      // For headers and footers: traditional %%VARIABLE%% pattern
      const matches = content.match(/%%([A-Z_]+)%%/g);
      return matches ? matches.map(match => match.replace(/%%/g, '')) : [];
    }
  }, []);

  // Function to get default value for a variable
  const getDefaultValue = useCallback((variableName, content) => {
    // For data-variable based variables, extract from content
    if (variableName.startsWith('LABEL_') || 
        variableName.startsWith('TITLE_') || 
        variableName.startsWith('PARAGRAPH_') ||
        variableName.startsWith('BUTTON_TEXT_')) {
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // Extract counter from variable name
      const match = variableName.match(/_(\d+)$/);
      const counter = match ? parseInt(match[1]) : 1;
      
      if (variableName.startsWith('LABEL_')) {
        const labels = doc.querySelectorAll('[data-variable="LABEL"]');
        if (labels[counter - 1]) {
          return labels[counter - 1].textContent.trim();
        }
      } else if (variableName.startsWith('TITLE_')) {
        const titles = doc.querySelectorAll('[data-variable="TITLE"]');
        if (titles[counter - 1]) {
          return titles[counter - 1].innerHTML.trim();
        }
      } else if (variableName.startsWith('PARAGRAPH_')) {
        const paragraphs = doc.querySelectorAll('[data-variable="PARAGRAPH"]');
        if (paragraphs[counter - 1]) {
          return paragraphs[counter - 1].textContent.trim();
        }
      } else if (variableName.startsWith('BUTTON_TEXT_')) {
        const buttons = doc.querySelectorAll('[data-variable="BUTTON"]');
        if (buttons[counter - 1]) {
          return buttons[counter - 1].textContent.trim();
        }
      }
    } else if (variableName.startsWith('IMG_SRC_')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const match = variableName.match(/_(\d+)$/);
      const counter = match ? parseInt(match[1]) : 1;
      const images = doc.querySelectorAll('[data-variable="IMG"]');
      if (images[counter - 1]) {
        return images[counter - 1].getAttribute('src') || '';
      }
    } else if (variableName.startsWith('IMG_ALT_')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const match = variableName.match(/_(\d+)$/);
      const counter = match ? parseInt(match[1]) : 1;
      const images = doc.querySelectorAll('[data-variable="IMG"]');
      if (images[counter - 1]) {
        return images[counter - 1].getAttribute('alt') || '';
      }
    } else if (variableName.startsWith('IMG_TITLE_')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const match = variableName.match(/_(\d+)$/);
      const counter = match ? parseInt(match[1]) : 1;
      const images = doc.querySelectorAll('[data-variable="IMG"]');
      if (images[counter - 1]) {
        return images[counter - 1].getAttribute('title') || '';
      }
    } else if (variableName.startsWith('BUTTON_HREF_')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const match = variableName.match(/_(\d+)$/);
      const counter = match ? parseInt(match[1]) : 1;
      const buttons = doc.querySelectorAll('[data-variable="BUTTON"]');
      if (buttons[counter - 1]) {
        return buttons[counter - 1].getAttribute('href') || '';
      }
    } else if (variableName.startsWith('LINK_HREF_')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const match = variableName.match(/_(\d+)$/);
      const counter = match ? parseInt(match[1]) : 1;
      const links = doc.querySelectorAll('[data-variable="LINK"]');
      if (links[counter - 1]) {
        return links[counter - 1].getAttribute('href') || '';
      }
    }

    // Fallback for traditional %%VARIABLE%% format
    return 'Default Value';
  }, []);

  // Helper function to get simple default values without needing content
  const getSimpleDefaultValue = useCallback((variableName) => {
    if (variableName.startsWith('LABEL_')) {
      return 'Label Text';
    } else if (variableName.startsWith('TITLE_')) {
      return 'Title Text';
    } else if (variableName.startsWith('IMG_SRC_')) {
      return 'https://via.placeholder.com/400x300';
    } else if (variableName.startsWith('IMG_ALT_')) {
      return 'Image description';
    } else if (variableName.startsWith('IMG_TITLE_')) {
      return 'Image title';
    } else if (variableName.startsWith('PARAGRAPH_')) {
      return 'Paragraph text content';
    } else if (variableName.startsWith('BUTTON_HREF_')) {
      return '#';
    } else if (variableName.startsWith('BUTTON_TEXT_')) {
      return 'Button Text';
    } else if (variableName.startsWith('LINK_HREF_')) {
      return '#';
    } else {
      return 'Default Value';
    }
  }, []);

  // Initialize variable values with defaults
  const initializeVariableValues = useCallback((variables, type, name) => {
    setVariableValues(prev => {
      const newValues = { ...prev };

      // Default values for known templates
      let templateDefaultValues = {};
      if (type === 'footer' && name === 'footer1') {
        templateDefaultValues = {
          'LOGO_SRC': 'https://files.kzsoftworks.com/newsletters/2024/EmailImages/kaizen_software_shdgib.png',
          'LOGO_ALT': 'Kaizen Software Logo',
          'COMPANY_NAME': 'Kaizen Software',
          'PHONE': '+1 (555) 123-4567',
          'EMAIL': 'info@kzsoftworks.com',
          'WEBSITE': 'www.kzsoftworks.com',
          'ADDRESS': '123 Tech Street, Innovation City, IC 12345',
          'UNSUBSCRIBE_LINK': '#unsubscribe',
          'PRIVACY_LINK': 'https://kzsoftworks.com/privacy',
          'TERMS_LINK': 'https://kzsoftworks.com/terms',
          'BEHANCE_LINK': 'https://behance.net/kaizensoftworks',
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
        };
      }

      variables.forEach(variable => {
        const valueKey = `${type}_${name}_${variable}`;
        if (!newValues[valueKey]) {
          // Use template defaults or simple default values
          newValues[valueKey] = templateDefaultValues[variable] || getSimpleDefaultValue(variable);
        }
      });

      return newValues;
    });
  }, [getSimpleDefaultValue]);

  return {
    // State
    headerVariables,
    sectionVariables,
    footerVariables,
    variableValues,
    categorizedVariables,
    
    // Setters
    setHeaderVariables,
    setSectionVariables,
    setFooterVariables,
    setVariableValues,
    setCategorizedVariables,
    
    // Functions
    categorizeVariable,
    categorizeTemplateVariables,
    isImageVariable,
    extractVariables,
    initializeVariableValues,
    getDefaultValue
  };
};
