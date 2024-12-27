'use client'

import { useParams } from 'next/navigation';
import { useLocalStorage } from '../../utils/loaclStorage';
import Questionaire from '../../components/Questionaire';

export default function UniversityPage() {
  const [consentGiven, setConsentGiven] = useLocalStorage('consentGiven', false);
  const [formData, setFormData] = useLocalStorage('formData', {});
  const params = useParams();
  const university = (params?.university as string) || '';


  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConsentGiven(event.target.checked);
  };

  const handleFormSubmit = () => {
    setFormData({});
    localStorage.removeItem('formData');
  };

  const universityInfo = {
    ual: {
      name: 'UAL',
      contact: 'Dr Olufemi Isiaq via f.isiaq@arts.ac.uk',
      privacyLink: 'https://www.arts.ac.uk/privacy-information'
    },
    sol: {
      name: 'SOL',
      contact: 'Support Team via support@sol.edu',
      privacyLink: 'https://www.sol.edu/privacy'
    }
  }[university.toLowerCase()] || null;

  if (!universityInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">University not found</h1>
          <a href="/" className="text-blue-600 hover:underline">Return home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8 text-justify">
          <p>
            The {universityInfo.name} Computer and Data Science Programme is working to analyse the wellbeing needs of our students, enabling us to inform, develop and adopt a model of prevention and early intervention, and to target proactive support provision for our student cohorts and subgroups of students.
          </p>
          <p>
            This survey is intended to be anonymous, but you should be aware it is possible you may be identifiable within individual forms from the information you choose to provide. Forms will be stored within {universityInfo.name} and deleted after 3 years.
          </p>
          <p>
            You can withdraw your consent and have this data deleted if you contact {universityInfo.contact}.
          </p>
          <p>
            For more information about your privacy rights, go to <a href={universityInfo.privacyLink} target="_blank" rel="noopener noreferrer">{universityInfo.privacyLink}</a>.
          </p>
          <div className="mt-4">
            <label>
              <input 
                type="checkbox" 
                checked={consentGiven} 
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              I give my explicit consent for {universityInfo.name} to use any personal data and special category data I may choose to provide for the purposes described above.
            </label>
          </div>
        </div>
        {consentGiven && 
        <Questionaire 
          university={university} 
          formData={formData}
          setFormData={setFormData}
          onSubmitSuccess={handleFormSubmit}
        />}
      </main>
    </div>
  );
}