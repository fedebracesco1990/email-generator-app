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
      // For sections: replace real content extracted from HTML

      // 1. Replace image URLs
      let imgCounter = 1;
      result = result.replace(/src="([^"]+)"/g, (match, originalSrc) => {
        const varKey = `section_${name}_${sectionIndex}_IMG_SRC_${imgCounter}`;
        imgCounter++;
        const newSrc = variableValues[varKey] || originalSrc;
        return `src="${newSrc}"`;
      });

      // 2. Replace image alt texts
      let altCounter = 1;
      result = result.replace(/alt="([^"]+)"/g, (match, originalAlt) => {
        const varKey = `section_${name}_${sectionIndex}_IMG_ALT_${altCounter}`;
        altCounter++;
        const newAlt = variableValues[varKey] || originalAlt;
        return `alt="${newAlt}"`;
      });

      // 3. Replace link and button text pairs
      let pairCounter = 1;
      result = result.replace(/<a([^>]*)href="([^"]+)"([^>]*)>\s*([^<]+?)\s*<\/a>/g,
        (match, attrsBefore, originalHref, attrsAfter, originalButtonText) => {
          // Only process real links with meaningful text
          if (originalHref && originalHref !== '#' && originalHref !== '') {
            const trimmedText = originalButtonText.trim();

            if (trimmedText.length > 2) {
              // Keys for URL and button text
              const linkKey = `section_${name}_${sectionIndex}_LINK_PAIR_${pairCounter}`;
              const buttonKey = `section_${name}_${sectionIndex}_BUTTON_PAIR_${pairCounter}`;
              pairCounter++;

              // Get edited values or use originals
              const newHref = variableValues[linkKey] || originalHref;
              const newButtonText = variableValues[buttonKey] || trimmedText;

              return `<a${attrsBefore}href="${newHref}"${attrsAfter}>${newButtonText}</a>`;
            }
          }
          return match; // Keep unchanged if doesn't meet criteria
        }
      );

      // 4. Replace single links (without associated button text)
      let linkCounter = 1;
      // Use helper function to replace only href that are not in pairs
      const replaceSingleLinks = (html) => {
        return html.replace(/href="([^"#][^"]*)"/g, (match, originalHref) => {
          // Check that this href is not within an already processed pair
          let isPaired = false;
          html.replace(/<a[^>]*href="([^"]+)"[^>]*>\s*([^<]+?)\s*<\/a>/g, (m, pairedHref) => {
            if (pairedHref === originalHref) {
              isPaired = true;
            }
            return m;
          });

          if (!isPaired && originalHref && originalHref !== '#' && originalHref !== '') {
            const varKey = `section_${name}_${sectionIndex}_LINK_${linkCounter}`;
            linkCounter++;
            const newHref = variableValues[varKey] || originalHref;
            return `href="${newHref}"`;
          }
          return match; // Keep anchors unchanged
        });
      };

      result = replaceSingleLinks(result);

      // 5. Replace texts within td cells
      let textCounter = 1;
      result = result.replace(/<td([^>]*)>\s*([^<]{4,})\s*<\/td>/g, (match, attrs, originalText) => {
        // Only try to replace meaningful texts (more than 3 characters)
        const trimmedText = originalText.trim();
        if (trimmedText.length > 3 && !trimmedText.startsWith('http')) {
          const varKey = `section_${name}_${sectionIndex}_TEXT_${textCounter}`;
          textCounter++;
          const newText = variableValues[varKey] || trimmedText;
          return `<td${attrs}>${newText}</td>`;
        }
        return match; // Return original if doesn't meet criteria
      });

      return result;
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
