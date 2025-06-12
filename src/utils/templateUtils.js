// src/utils/templateUtils.js

/**
 * Email template utilities
 */

/**
 * Replaces variables in section templates using custom attributes
 * @param {string} content - HTML content of the template
 * @param {Array} variables - List of variables to replace
 * @param {Object} variableValues - Variable values
 * @param {string} name - Template name
 * @returns {string} - HTML content with replaced variables
 */
export const replaceSectionVariables = (content, variables, variableValues, name, sectionIndex = 0) => {
    if (!content) return '';
    
    // Counter map for different variable types
    const counters = {
      img: 1,
      alt: 1,
      title: 1,
      label: 1,
      title_var: 1,
      paragraph: 1,
      button_link: 1,
      button_text: 1,
      link: 1
    };
    
    // Make a copy of the content to avoid modifying the original
    let result = content;
    
    // Process each variable by type
    variables.forEach(varName => {
      // Construimos la clave según el formato que utiliza SectionEditor
      const sectionKey = `section_${name}_${sectionIndex}_${varName}`;
      
      // Intentamos obtener el valor usando la clave de sección primero
      // Si no existe, intentamos la clave directa del varName por compatibilidad
      const value = variableValues[sectionKey] || variableValues[varName] || '';
      
      // 1. Replace labels (data-variable="LABEL")
      if (varName.startsWith('LABEL_')) {
        const labelRegex = new RegExp(`<td[^>]*data-variable="LABEL"[^>]*>[\\s\\S]*?<\\/td>`, 'g');
        let matchCount = 0;
        
        result = result.replace(labelRegex, (match) => {
          matchCount++;
          if (matchCount === counters.label) {
            counters.label++;
            // Preserve all td attributes, but change the content
            return match.replace(/>([\s\S]*?)<\/td>/, `>${value}</td>`);
          }
          return match;
        });
      }
      
      // 2. Replace titles (data-variable="TITLE")
      else if (varName.startsWith('TITLE_')) {
        const titleRegex = new RegExp(`<td[^>]*data-variable="TITLE"[^>]*>[\\s\\S]*?<\\/td>`, 'g');
        let matchCount = 0;
        
        result = result.replace(titleRegex, (match) => {
          matchCount++;
          if (matchCount === counters.title_var) {
            counters.title_var++;
            // Value may contain HTML like <br> or <span>, preserve it
            return match.replace(/>([\s\S]*?)<\/td>/, `>${value}</td>`);
          }
          return match;
        });
      }
      
      // 3. Replace image src (data-variable="IMG")
      else if (varName.startsWith('IMG_SRC_')) {
        const imgSrcRegex = new RegExp(`<img[^>]*data-variable="IMG"[^>]*src="([^"]*)"[^>]*>`, 'g');
        let matchCount = 0;
        
        result = result.replace(imgSrcRegex, (match) => {
          matchCount++;
          if (matchCount === counters.img) {
            counters.img++;
            return match.replace(/src="([^"]*)"/, `src="${value}"`);
          }
          return match;
        });
      }
      
      // 4. Replace image alt
      else if (varName.startsWith('IMG_ALT_')) {
        const imgAltRegex = new RegExp(`<img[^>]*data-variable="IMG"[^>]*alt="([^"]*)"[^>]*>`, 'g');
        let matchCount = 0;
        
        result = result.replace(imgAltRegex, (match) => {
          matchCount++;
          if (matchCount === counters.alt) {
            counters.alt++;
            return match.replace(/alt="([^"]*)"/, `alt="${value}"`);
          }
          return match;
        });
      }
      
      // 5. Replace image title
      else if (varName.startsWith('IMG_TITLE_')) {
        const imgTitleRegex = new RegExp(`<img[^>]*data-variable="IMG"[^>]*title="([^"]*)"[^>]*>`, 'g');
        let matchCount = 0;
        
        result = result.replace(imgTitleRegex, (match) => {
          matchCount++;
          if (matchCount === counters.title) {
            counters.title++;
            return match.replace(/title="([^"]*)"/, `title="${value}"`);
          }
          return match;
        });
      }
      
      // 6. Replace paragraphs (data-variable="PARAGRAPH")
      else if (varName.startsWith('PARAGRAPH_')) {
        // Extraer el número del párrafo del nombre de la variable (ej. PARAGRAPH_1 -> 1)
        const paragraphNum = parseInt(varName.split('_')[1]) || 1;
        const paragraphRegex = new RegExp(`<td[^>]*data-variable="PARAGRAPH"[^>]*>[\s\S]*?<\/td>`, 'g');
        let matchCount = 0;
        
        console.log(`Reemplazando párrafo ${paragraphNum}, counters.paragraph=${counters.paragraph}`);
        
        result = result.replace(paragraphRegex, (match) => {
          matchCount++;
          // Usar el número específico del párrafo en lugar del contador general
          if (matchCount === paragraphNum) {
            // No incrementamos counters.paragraph aquí para permitir múltiples actualizaciones
            console.log(`Reemplazando contenido del párrafo ${paragraphNum} con: ${value.substring(0, 30)}...`);
            return match.replace(/>[\s\S]*?<\/td>/, `>${value}</td>`);
          }
          return match;
        });
      }
      
      // 7. Replace button hrefs (data-variable="BUTTON")
      else if (varName.startsWith('BUTTON_LINK_')) {
        // Extract button number from variable name (e.g., BUTTON_LINK_1 -> 1)
        const buttonNum = parseInt(varName.split('_')[2]) || 1;
        const buttonLinkRegex = new RegExp(`<a[^>]*data-variable="BUTTON"[^>]*href="([^"]*)"[^>]*>`, 'g');
        let matchCount = 0;
        
        console.log(`Replacing button ${buttonNum} link with: "${value}"`);
        
        result = result.replace(buttonLinkRegex, (match) => {
          matchCount++;
          // Use specific button number instead of general counter
          if (matchCount === buttonNum) {
            // Don't increment the counter to allow independent updates
            console.log(`Replaced button ${buttonNum} link with: "${value}"`);
            return match.replace(/href="([^"]*)"/, `href="${value}"`);
          }
          return match;
        });
      }
      
      // 8. Replace button text
      else if (varName.startsWith('BUTTON_TEXT_')) {
        // Extraer el número del botón del nombre de la variable (ej. BUTTON_TEXT_1 -> 1)
        const buttonNum = parseInt(varName.split('_')[2]) || 1;
        const buttonTextRegex = new RegExp(`<a[^>]*data-variable="BUTTON"[^>]*>[\s\S]*?<\/a>`, 'g');
        let matchCount = 0;
        
        console.log(`Reemplazando texto del botón ${buttonNum}, valor: "${value}"`);
        
        result = result.replace(buttonTextRegex, (match) => {
          matchCount++;
          // Usar el número específico del botón en lugar del contador general
          if (matchCount === buttonNum) {
            // No incrementamos el contador para permitir actualizaciones independientes
            console.log(`Reemplazando texto del botón ${buttonNum} con: "${value}"`);
            return match.replace(/>[\s\S]*?<\/a>/, `>${value}</a>`);
          }
          return match;
        });
      }
      
      // 9. Replace link hrefs (data-variable="LINK") - LINK only changes the href attribute
      else if (varName.startsWith('LINK_URL_')) {
        // Extract link number from variable name (e.g., LINK_URL_1 -> 1)
        const linkNum = parseInt(varName.split('_')[2]) || 1;
        const linkRegex = new RegExp(`<a[^>]*data-variable="LINK"[^>]*href="([^"]*)"[^>]*>`, 'g');
        let matchCount = 0;
        
        console.log(`Replacing link ${linkNum} URL with: "${value}"`);
        
        result = result.replace(linkRegex, (match) => {
          matchCount++;
          // Use specific link number instead of general counter
          if (matchCount === linkNum) {
            // Don't increment the counter to allow independent updates
            console.log(`Replaced link ${linkNum} URL with: "${value}"`);
            return match.replace(/href="([^"]*)"/, `href="${value}"`);
          }
          return match;
        });
      }
      
      // 10. Support for legacy variables (for compatibility)
      else if (varName.startsWith('LINK_PAIR_') || varName.startsWith('LINK_')) {
        const linkRegex = new RegExp(`href="[^"#][^"]*"`, 'g');
        result = result.replace(linkRegex, `href="${value}"`);
      }
      else if (varName.startsWith('BUTTON_PAIR_')) {
        const buttonRegex = new RegExp(`<a[^>]*>[\\s\\S]*?<\\/a>`, 'g');
        result = result.replace(buttonRegex, (match) => {
          return match.replace(/>[\\s\\S]*?<\/a>/, `>${value}</a>`);
        });
      }
      else if (varName.startsWith('TEXT_')) {
        // For legacy regular text
        const varIndex = variables.indexOf(varName);
        if (variables[varIndex]) {
          const escapedValue = variables[varIndex].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const textRegex = new RegExp(`(>${escapedValue}<)|(>${escapedValue}\\s*<)|(\\s+${escapedValue}\\s+)`, 'g');
          result = result.replace(textRegex, (match) => {
            if (match.startsWith('>') && match.endsWith('<')) {
              return `>${value}<`;
            } else if (match.startsWith('>')) {
              return `>${value} <`;
            } else {
              return ` ${value} `;
            }
          });
        }
      }
    });
    
    return result;
  };
  
  /**
   * Replaces variables in headers and footers using traditional variable format
   * @param {string} content - HTML content of the template
   * @param {string} type - Template type: 'header' or 'footer'
   * @param {string} name - Template name
   * @param {Object} variableValues - Variable values
   * @returns {string} - HTML content with replaced variables
   */
  export const replaceHeaderFooterVariables = (content, type, name, variableValues) => {
    if (!content) return '';
    
    let result = content;
    
    // First step: replace image variables directly in src attributes
    result = result.replace(/<img([^>]*)src="%%([A-Z_]+)%%"([^>]*)>/g, (match, before, varName, after) => {
      const key = `${type}_${name}_${varName}`;
      const imgUrl = variableValues[key] || '';
      if (imgUrl) {
        return `<img${before}src="${imgUrl}"${after}>`;
      } else {
        // If no URL is provided, use a transparent image
        return `<img${before}src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="${after}>`;
      }
    });
    
    // Second step: replace other variables (text, alt, etc.)
    const regex = /%%([A-Z_]+)%%/g;
    result = result.replace(regex, (match, variableName) => {
      const key = `${type}_${name}_${variableName}`;
      return variableValues[key] || '';
    });
    
    return result;
  };
  
  /**
   * Main function to replace template variables with actual values
   * @param {string} templateContent - HTML content of the template
   * @param {string} type - Template type: 'header', 'sections', or 'footer'
   * @param {string} name - Template name
   * @param {Object} variableValues - Variable values
   * @param {Object} sectionVariables - Variables for sections (only used with type='sections')
   * @param {number} sectionIndex - Section index (only used with type='sections')
   * @returns {string} - HTML content with replaced variables
   */
  export const replaceTemplateVariables = (
    templateContent, 
    type, 
    name, 
    variableValues,
    sectionVariables = {},
    sectionIndex = 0
  ) => {
    if (!templateContent) return '';
    
    // For sections, we need to replace variables with custom attributes
    if (type === 'sections') {
      // Get variables for this template
      const variables = sectionVariables[name] || [];
      // Pasamos el índice de la sección para construir las claves correctamente
      return replaceSectionVariables(templateContent, variables, variableValues, name, sectionIndex);
    } else {
      // For headers and footers, we handle traditional %%VARIABLE%% variables
      return replaceHeaderFooterVariables(templateContent, type, name, variableValues);
    }
  };