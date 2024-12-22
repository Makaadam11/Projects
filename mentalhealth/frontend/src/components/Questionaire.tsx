
import { useState } from 'react'
import SingleSelect from './Questionaire/SingleSelect'
import Slider from './Questionaire/Slider'
import { Question, surveyQuestions } from '../types/QuestionaireTypes'
import MultiSelect from './Questionaire/MultiSelect';
import DropdownSelect from './Questionaire/DropdownSelect'
import { TextInput } from './Questionaire/TextInput';

export default function Questionaire() {
  const [formData, setFormData] = useState<Record<string, any>>({});


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form data:', formData)
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'single':
        return (
          <div key={question.id}>
            <SingleSelect
              question={question.question}
              options={question.options || []}
              value={formData[question.id] || ''}
              onValueChange={(value) => setFormData(prev => ({...prev, [question.id]: value}))}
            />
          </div>
        )
      case 'slider':
        return (
          <div key={question.id}>
            <Slider
              question={question.question}
              min={question.min || 0}
              max={question.max || 100}
              step={question.step || 1}
              value={formData[question.id] || 0}
              onValueChange={(value) => setFormData(prev => ({...prev, [question.id]: value}))}
            />
          </div>
        )
      case 'multi':
        return (
          <div key={question.id}>
            <MultiSelect
              question={question.question}
              options={question.options || []}
              value={formData[question.id] || []}
              onValueChange={(value) => setFormData(prev => ({...prev, [question.id]: value}))}
            />
          </div>
        )
      case 'text':
        return (
          <div key={question.id}>
            <TextInput
              question={question.question}
              value={formData[question.id] || ''}
              onValueChange={(value) => setFormData(prev => ({...prev, [question.id]: value}))}
            />
          </div>
        )
      case 'dropdown':
        return (
          <div key={question.id}>
            <DropdownSelect
              question={question.question}
              options={question.options || []}
              value={formData[question.id] || ''}
              onValueChange={(value) => setFormData(prev => ({...prev, [question.id]: value}))}
            />
          </div>
        )
      case 'textinput':
        return (
          <div key={question.id}>
            <TextInput
              question={question.question}
              value={formData[question.id] || ''}
              onValueChange={(value) => setFormData(prev => ({...prev, [question.id]: value}))}
            />
          </div>
        )
    }
  }

  return (
    <div>
      <form className="space-y-8 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Student Survey</h1>
        {surveyQuestions.map(renderQuestion)}
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">
          Submit
        </button>
      </form>
    </div>
  )
}