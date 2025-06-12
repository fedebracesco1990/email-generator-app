import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for generating email HTML with variable replacement
 */
export const useEmailGenerator = (templateHook, variableHook) => {
  const [emailHTML, setEmailHTML] = useState('');

  const { variableValues } = variableHook;
  const {
    templateMaster,
    headerContent,
    footerContent,
    sectionContents,
    selectedSections,
    selectedHeader,
    selectedFooter
  } = templateHook;

  // Enhanced function to replace variables in HTML templates
  const replaceTemplateVariables = useCallback((template, type, name, sectionIndex = null) => {
    if (!template) return '';

    // Create a copy of the template to work with
    let result = template;

    if (type === 'section') {
      // For sections: replace content based on data-variable attributes
      const parser = new DOMParser();
      const doc = parser.parseFromString(result, 'text/html');
      
      // Track counters for each variable type
      let labelCounter = 1;
      let titleCounter = 1;
      let imgCounter = 1;
      let paragraphCounter = 1;
      let buttonCounter = 1;
      let linkCounter = 1;

      // Process LABEL elements
      const labels = doc.querySelectorAll('[data-variable="LABEL"]');
      labels.forEach((element) => {
        const varKey = `section_${name}_${sectionIndex}_LABEL_${labelCounter}`;
        const newValue = variableValues[varKey];
        if (newValue !== undefined) {
          element.textContent = newValue;
        }
        labelCounter++;
      });

      // Process TITLE elements
      const titles = doc.querySelectorAll('[data-variable="TITLE"]');
      titles.forEach((element) => {
        const varKey = `section_${name}_${sectionIndex}_TITLE_${titleCounter}`;
        const newValue = variableValues[varKey];
        if (newValue !== undefined) {
          element.innerHTML = newValue;
        }
        titleCounter++;
      });

      // Process IMG elements
      const images = doc.querySelectorAll('[data-variable="IMG"]');
      images.forEach((element) => {
        // Handle IMG_SRC
        const srcKey = `section_${name}_${sectionIndex}_IMG_SRC_${imgCounter}`;
        const newSrc = variableValues[srcKey];
        if (newSrc !== undefined) {
          element.setAttribute('src', newSrc);
        }

        // Handle IMG_ALT
        const altKey = `section_${name}_${sectionIndex}_IMG_ALT_${imgCounter}`;
        const newAlt = variableValues[altKey];
        if (newAlt !== undefined) {
          element.setAttribute('alt', newAlt);
        }

        // Handle IMG_TITLE
        const titleKey = `section_${name}_${sectionIndex}_IMG_TITLE_${imgCounter}`;
        const newTitle = variableValues[titleKey];
        if (newTitle !== undefined) {
          element.setAttribute('title', newTitle);
        }

        imgCounter++;
      });

      // Process PARAGRAPH elements
      const paragraphs = doc.querySelectorAll('[data-variable="PARAGRAPH"]');
      paragraphs.forEach((element) => {
        const varKey = `section_${name}_${sectionIndex}_PARAGRAPH_${paragraphCounter}`;
        const newValue = variableValues[varKey];
        if (newValue !== undefined) {
          element.textContent = newValue;
        }
        paragraphCounter++;
      });

      // Process BUTTON elements
      const buttons = doc.querySelectorAll('[data-variable="BUTTON"]');
      buttons.forEach((element) => {
        // Handle BUTTON_HREF
        const hrefKey = `section_${name}_${sectionIndex}_BUTTON_HREF_${buttonCounter}`;
        const newHref = variableValues[hrefKey];
        if (newHref !== undefined) {
          element.setAttribute('href', newHref);
        }

        // Handle BUTTON_TEXT
        const textKey = `section_${name}_${sectionIndex}_BUTTON_TEXT_${buttonCounter}`;
        const newText = variableValues[textKey];
        if (newText !== undefined) {
          element.textContent = newText;
        }

        buttonCounter++;
      });

      // Process LINK elements
      const links = doc.querySelectorAll('[data-variable="LINK"]');
      links.forEach((element) => {
        const hrefKey = `section_${name}_${sectionIndex}_LINK_HREF_${linkCounter}`;
        const newHref = variableValues[hrefKey];
        if (newHref !== undefined) {
          element.setAttribute('href', newHref);
        }
        linkCounter++;
      });

      // Return the modified HTML
      return doc.documentElement.innerHTML;
    } else {
      // For headers and footers: handle traditional %%VARIABLE%% variables

      // First step: replace image variables directly in src attributes
      result = result.replace(/<img([^>]*)src="%%([A-Z_]+)%%"([^>]*)>/g, (match, before, varName, after) => {
        const key = `${type}_${name}_${varName}`;
        const imgUrl = variableValues[key] || '';
        if (imgUrl) {
          return `<img${before}src="${imgUrl}"${after}>`;
        } else {
          // If no URL, put a transparent image
          return `<img${before}src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="${after}>`;
        }
      });

      // Second step: replace other variables (texts, alt, etc.)
      const regex = /%%([A-Z_]+)%%/g;
      result = result.replace(regex, (match, variableName) => {
        const key = `${type}_${name}_${variableName}`;
        return variableValues[key] || '';
      });
    }

    return result;
  }, [variableValues]);

  // Function to generate email HTML
  const generateEmailHTML = useCallback(() => {
    if (!templateMaster || !headerContent || !footerContent) return '';

    try {
      // Replace variables in header
      const processedHeader = replaceTemplateVariables(headerContent, 'header', selectedHeader);
      // Wrap header in required table structure
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

          // Wrap each section in required table structure
          return `<tr>
            <td align="center" style="background-color:#181f47;">
              ${processedContent.replace(/<custom type="content" name="contentarea1">/, '')}
            </td>
          </tr>`;
        })
        .join('');

      // Replace variables in footer
      const processedFooter = replaceTemplateVariables(footerContent, 'footer', selectedFooter);
      // Wrap footer in required table structure
      const wrappedFooter = `<tr>
        <td align="center" style="background-color:#181f47;">
          ${processedFooter.replace(/<custom type="content" name="contentarea1">/, '')}
        </td>
      </tr>`;

      // Generate final HTML by replacing placeholders in master template
      return templateMaster
        .replace('%%HEADER%%', wrappedHeader)
        .replace('%%SECTIONS%%', sectionsHTML)
        .replace('%%FOOTER%%', wrappedFooter);
    } catch (error) {
      console.error('Error generating email HTML:', error);
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

  // Update email preview when relevant dependencies change
  useEffect(() => {
    // Only update when templates are initially loaded
    if (templateMaster && headerContent && footerContent) {
      const newHTML = generateEmailHTML();
      setEmailHTML(newHTML);
    }

    // Create a global function so child components can update HTML
    window.updateEmailPreview = () => {
      if (templateMaster && headerContent && footerContent) {
        const newHTML = generateEmailHTML();
        setEmailHTML(newHTML);
      }
    };

    // Clean up global function when component unmounts
    return () => {
      window.updateEmailPreview = undefined;
    };
  }, [templateMaster, headerContent, footerContent, variableValues, generateEmailHTML]);

  return {
    emailHTML,
    generateEmailHTML,
    replaceTemplateVariables
  };
};
