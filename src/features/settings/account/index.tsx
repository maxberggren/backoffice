import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='AI Configuration'
      desc='Configure AI model parameters and optimization preferences for your HVAC systems.'
    >
      <AccountForm />
    </ContentSection>
  )
}
