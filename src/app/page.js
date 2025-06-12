'use client';

import { useEmailBuilder } from '../hooks';
import styles from './page.module.css';

// Import components
import HeaderEditor from '../components/HeaderEditor';
import SectionEditor from '../components/SectionEditor';
import FooterEditor from '../components/FooterEditor';
import EmailPreview from '../components/EmailPreview';

export default function Home() {
  // Use the main email builder hook that combines all functionality
  const {
    // Template states
    selectedHeader,
    selectedSections,
    selectedFooter,
    availableHeaders,
    availableSections,
    availableFooters,
    setSelectedHeader,
    setSelectedFooter,
    
    // Variable states
    headerVariables,
    sectionVariables,
    footerVariables, 
    variableValues,
    setVariableValues,
    categorizedVariables,
    isImageVariable,
    
    // Email generation
    emailHTML,
    
    // Section management
    addSection,
    removeSection,
    changeSection
  } = useEmailBuilder();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Constructor de Emails</h1>
        <p>Seleccione los componentes para construir su email</p>
      </header>

      <div className={styles.builderContainer}>
        <div className={styles.controlsPanel}>
          {/* Header component */}
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

          {/* Sections component */}
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

          {/* Footer component */}
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

        {/* Email preview component */}
        <EmailPreview emailHTML={emailHTML} />
      </div>
    </div>
  );
}
