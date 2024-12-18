'use client'

import { useState } from 'react';
import ClientForm from '../components/Questionaire';

export default function Home() {
  const [consentGiven, setConsentGiven] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConsentGiven(event.target.checked);
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
      <div className="mb-8 text-justify">
      <p>
            The CCI Computer and Data Science Programme is working to analyse the wellbeing needs of our students, enabling us to inform, develop and adopt a model of prevention and early intervention, and to target proactive support provision for our student cohorts and subgroups of students. We are adopting the most recent tools and techniques of Artificial Intelligence (AI) to inform our decisions and proactive support.
          </p>
          <p>
            This survey is intended to be anonymous, but you should be aware it is possible you may be identifiable within individual forms from the information you choose to provide. Our lawful basis for processing this data is GDPR Art.6 ‘consent’ and Art. 9 ‘Explicit consent’ for any special category data. Forms will be stored within UAL and deleted after 3 years, after which all data will be statistical and anonymous. Please give your consent if you want to proceed with the survey.
          </p>
          <p>
            You can withdraw your consent and have this data deleted if you contact Dr Olufemi Isiaq via f.isiaq@arts.ac.uk and can confirm the responses that uniquely relate to you, so that your form can be identified.
          </p>
          <p>
            For more information about UAL and your privacy rights, go to <a href="https://www.arts.ac.uk/privacy-information" target="_blank" rel="noopener noreferrer">www.arts.ac.uk/privacy-information</a>.
          </p>
          <div className="mt-4">
            <label>
              <input type="checkbox" checked={consentGiven} onChange={handleCheckboxChange} />
              {' '}I give my explicit consent for UAL to use any personal data and special category data I may choose to provide for the purposes described above.
            </label>
          </div>
        </div>
        {consentGiven && <ClientForm />}
      </main>
    </div>
  );
}