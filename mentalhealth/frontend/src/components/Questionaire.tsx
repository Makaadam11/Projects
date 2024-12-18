
import { useState } from 'react'
import SingleSelect from './Questionaire/SingleSelect'
import Slider from './Questionaire/Slider'
import MultiSelect from './Questionaire/MultiSelect'
import { TextInput } from './Questionaire/TextInput'

export default function ClientForm() {
  const [formData, setFormData] = useState({
    ethnicGroup: '',
    studyHours: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form data:', formData)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Student Survey</h1>
        
        <SingleSelect 
          value={formData.ethnicGroup}
          onValueChange={(value) => setFormData(prev => ({...prev, ethnicGroup: value}))}
        />
        
        <Slider 
          value={formData.studyHours}
          onValueChange={(value) => setFormData(prev => ({...prev, studyHours: value}))}
        />

        <MultiSelect value={[]} onValueChange={function (value: string[]): void {
          throw new Error('Function not implemented.')
        } }/>
        
        <TextInput value={''} onChange={function (value: string): void {
          throw new Error('Function not implemented.')
        } }/>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  )
}