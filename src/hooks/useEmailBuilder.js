import { useVariableManager } from './useVariableManager';
import { useTemplateManager } from './useTemplateManager';
import { useEmailGenerator } from './useEmailGenerator';
import { useSectionManager } from './useSectionManager';

/**
 * Main hook that combines all email builder functionality
 * This is the main hook to use in components
 */
export const useEmailBuilder = () => {
  // Initialize variable management
  const variableHook = useVariableManager();
  
  // Initialize template management with variable hook
  const templateHook = useTemplateManager(variableHook);
  
  // Initialize email generation with template and variable hooks
  const emailHook = useEmailGenerator(templateHook, variableHook);
  
  // Initialize section management with template hook
  const sectionHook = useSectionManager(templateHook);

  return {
    // Variable management
    ...variableHook,
    
    // Template management
    ...templateHook,
    
    // Email generation
    ...emailHook,
    
    // Section management
    ...sectionHook
  };
};
