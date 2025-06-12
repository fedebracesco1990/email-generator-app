import { useCallback } from 'react';

/**
 * Custom hook for managing sections (add, remove, change)
 */
export const useSectionManager = (templateHook) => {
  const { selectedSections, setSelectedSections } = templateHook;

  // Add a new section
  const addSection = useCallback(() => {
    setSelectedSections(prev => [...prev, 'section1']);
  }, [setSelectedSections]);

  // Remove a section
  const removeSection = useCallback((index) => {
    setSelectedSections(prev => {
      const newSections = [...prev];
      newSections.splice(index, 1);
      return newSections;
    });
  }, [setSelectedSections]);

  // Change a specific section
  const changeSection = useCallback((index, value) => {
    setSelectedSections(prev => {
      const newSections = [...prev];
      newSections[index] = value;
      return newSections;
    });
  }, [setSelectedSections]);

  // Move section up
  const moveSectionUp = useCallback((index) => {
    if (index > 0) {
      setSelectedSections(prev => {
        const newSections = [...prev];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        return newSections;
      });
    }
  }, [setSelectedSections]);

  // Move section down
  const moveSectionDown = useCallback((index) => {
    setSelectedSections(prev => {
      if (index < prev.length - 1) {
        const newSections = [...prev];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        return newSections;
      }
      return prev;
    });
  }, [setSelectedSections]);

  // Duplicate a section
  const duplicateSection = useCallback((index) => {
    setSelectedSections(prev => {
      const newSections = [...prev];
      const sectionToDuplicate = newSections[index];
      newSections.splice(index + 1, 0, sectionToDuplicate);
      return newSections;
    });
  }, [setSelectedSections]);

  // Clear all sections
  const clearAllSections = useCallback(() => {
    setSelectedSections([]);
  }, [setSelectedSections]);

  // Replace all sections with new array
  const replaceSections = useCallback((newSections) => {
    setSelectedSections(newSections);
  }, [setSelectedSections]);

  return {
    selectedSections,
    addSection,
    removeSection,
    changeSection,
    moveSectionUp,
    moveSectionDown,
    duplicateSection,
    clearAllSections,
    replaceSections
  };
};
