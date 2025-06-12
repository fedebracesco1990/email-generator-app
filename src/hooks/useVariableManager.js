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

  // Function to check variable type
  const categorizeVariable = useCallback((variableName) => {
    // Classify variables based on their name
    if (variableName.includes('SRC') || variableName.includes('IMG_SRC')) {
      return 'image';
    } else if (variableName.includes('LINK') || variableName.includes('URL') || variableName.includes('HREF')) {
      return 'link';
    } else if (variableName.includes('ALT') || variableName.includes('TITLE') || variableName.includes('IMG_ALT')) {
      return 'attribute';
    } else if (variableName.includes('BUTTON')) {
      return 'text'; // Treat button texts as normal text
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

  // Function to check if a variable is likely to be an image URL
  const isImageVariable = useCallback((variableName) => {
    return categorizeVariable(variableName) === 'image';
  }, [categorizeVariable]);

  // Function to extract variables from template content
  const extractVariables = useCallback((content, type = null) => {
    if (type === 'sections') {
      // For sections, extract editable content maintaining order of appearance
      const variables = [];
      const orderedElementsMap = new Map(); // Map to store elements and their positions

      // Analyze HTML to detect elements in their order of appearance

      // 1. Detect buttons and links (with position)
      const linkButtonRegex = /<a[^>]*href="([^"]+)"[^>]*>\s*([^<]+?)\s*<\/a>/g;
      let linkButtonMatch;
      let pairCounter = 1;

      while ((linkButtonMatch = linkButtonRegex.exec(content)) !== null) {
        const href = linkButtonMatch[1];
        const buttonText = linkButtonMatch[2].trim();
        const position = linkButtonMatch.index;

        if (href !== '#' && href !== '' && buttonText.length > 2) {
          // Save position for each link+button pair
          orderedElementsMap.set(`LINK_PAIR_${pairCounter}`, {
            type: 'link_pair',
            position: position,
            value: href
          });

          orderedElementsMap.set(`BUTTON_PAIR_${pairCounter}`, {
            type: 'button_pair',
            position: position + 1, // Place it right after the link
            value: buttonText
          });

          pairCounter++;
        }
      }

      // 2. Detect images and attributes
      const imgRegex = /<img([^>]*)>/g;
      let imgMatch;
      let imgCounter = 1;

      while ((imgMatch = imgRegex.exec(content)) !== null) {
        const imgTag = imgMatch[1];
        const position = imgMatch.index;

        // Extract src
        const srcMatch = /src="([^"]+)"/.exec(imgTag);
        if (srcMatch) {
          orderedElementsMap.set(`IMG_SRC_${imgCounter}`, {
            type: 'image',
            position: position,
            value: srcMatch[1]
          });
        }

        // Extract alt
        const altMatch = /alt="([^"]+)"/.exec(imgTag);
        if (altMatch) {
          orderedElementsMap.set(`IMG_ALT_${imgCounter}`, {
            type: 'attribute',
            position: position + 1, // Right after the src
            value: altMatch[1]
          });
        }

        imgCounter++;
      }

      // 3. Detect texts in td cells
      const textRegex = /<td[^>]*>\s*([^<]{4,})\s*<\/td>/g;
      let textMatch;
      let textCounter = 1;

      while ((textMatch = textRegex.exec(content)) !== null) {
        const text = textMatch[1].trim();
        const position = textMatch.index;

        if (text.length > 3 && !text.startsWith('http')) {
          orderedElementsMap.set(`TEXT_${textCounter}`, {
            type: 'text',
            position: position,
            value: text
          });
          textCounter++;
        }
      }

      // 4. Detect loose links
      const hrefRegex = /href="([^"#][^"]*)"/g;
      let hrefMatch;
      let linkCounter = 1;

      while ((hrefMatch = hrefRegex.exec(content)) !== null) {
        const href = hrefMatch[1];
        const position = hrefMatch.index;

        // Check that it's not part of an already detected pair
        let isDuplicate = false;
        orderedElementsMap.forEach((value, key) => {
          if (key.startsWith('LINK_PAIR_') && value.value === href) {
            isDuplicate = true;
          }
        });

        if (!isDuplicate && href !== '' && href !== '#') {
          orderedElementsMap.set(`LINK_${linkCounter}`, {
            type: 'link',
            position: position,
            value: href
          });
          linkCounter++;
        }
      }

      // Convert ordered elements map to array sorted by position
      const sortedElements = Array.from(orderedElementsMap.entries())
        .sort(([, a], [, b]) => a.position - b.position);

      // Extract variable names in correct order
      sortedElements.forEach(([variableName]) => {
        variables.push(variableName);
      });

      return variables;
    } else {
      // For headers and footers: traditional %%VARIABLE%% pattern
      const matches = content.match(/%%([A-Z_]+)%%/g);
      return matches ? matches.map(match => match.replace(/%%/g, '')) : [];
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
          newValues[valueKey] = templateDefaultValues[variable] || '';
        }
      });

      return newValues;
    });
  }, []);

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
    initializeVariableValues
  };
};
