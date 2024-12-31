export interface Course {
  name: string;
}

export interface CoursesResponse {
  courses: string[];
}

export interface QuestionaireProps {
  university: string;
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  onSubmitSuccess: () => void;
}

export interface QuestionarieData {
  answers: { id: string; answer: string | number | string[] }[];
  source: string;
}

export type QuestionType = 'single' | 'multi' | 'slider' | 'text' | 'dropdown' | 'textinput';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  showAboveMax?: boolean;
}

const countries = [
  { value: "", label: "Select a country" },
  { value: "AF", label: "Afghanistan" },
  { value: "AL", label: "Albania" },
  { value: "DZ", label: "Algeria" },
  { value: "AS", label: "American Samoa" },
  { value: "AD", label: "Andorra" },
  { value: "AO", label: "Angola" },
  { value: "AI", label: "Anguilla" },
  { value: "AQ", label: "Antarctica" },
  { value: "AG", label: "Antigua and Barbuda" },
  { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" },
  { value: "AW", label: "Aruba" },
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaijan" },
  { value: "BS", label: "Bahamas" },
  { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" },
  { value: "BB", label: "Barbados" },
  { value: "BY", label: "Belarus" },
  { value: "BE", label: "Belgium" },
  { value: "BZ", label: "Belize" },
  { value: "BJ", label: "Benin" },
  { value: "BM", label: "Bermuda" },
  { value: "BT", label: "Bhutan" },
  { value: "BO", label: "Bolivia" },
  { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BW", label: "Botswana" },
  { value: "BR", label: "Brazil" },
  { value: "IO", label: "British Indian Ocean Territory" },
  { value: "VG", label: "British Virgin Islands" },
  { value: "BN", label: "Brunei" },
  { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BI", label: "Burundi" },
  { value: "KH", label: "Cambodia" },
  { value: "CM", label: "Cameroon" },
  { value: "CA", label: "Canada" },
  { value: "CV", label: "Cape Verde" },
  { value: "KY", label: "Cayman Islands" },
  { value: "CF", label: "Central African Republic" },
  { value: "TD", label: "Chad" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CX", label: "Christmas Island" },
  { value: "CC", label: "Cocos Islands" },
  { value: "CO", label: "Colombia" },
  { value: "KM", label: "Comoros" },
  { value: "CK", label: "Cook Islands" },
  { value: "CR", label: "Costa Rica" },
  { value: "HR", label: "Croatia" },
  { value: "CU", label: "Cuba" },
  { value: "CW", label: "Curacao" },
  { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" },
  { value: "CD", label: "Democratic Republic of the Congo" },
  { value: "DK", label: "Denmark" },
  { value: "DJ", label: "Djibouti" },
  { value: "DM", label: "Dominica" },
  { value: "DO", label: "Dominican Republic" },
  { value: "TL", label: "East Timor" },
  { value: "EC", label: "Ecuador" },
  { value: "EG", label: "Egypt" },
  { value: "SV", label: "El Salvador" },
  { value: "GQ", label: "Equatorial Guinea" },
  { value: "ER", label: "Eritrea" },
  { value: "EE", label: "Estonia" },
  { value: "ET", label: "Ethiopia" },
  { value: "FK", label: "Falkland Islands" },
  { value: "FO", label: "Faroe Islands" },
  { value: "FJ", label: "Fiji" },
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  { value: "PF", label: "French Polynesia" },
  { value: "GA", label: "Gabon" },
  { value: "GM", label: "Gambia" },
  { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" },
  { value: "GH", label: "Ghana" },
  { value: "GI", label: "Gibraltar" },
  { value: "GR", label: "Greece" },
  { value: "GL", label: "Greenland" },
  { value: "GD", label: "Grenada" },
  { value: "GU", label: "Guam" },
  { value: "GT", label: "Guatemala" },
  { value: "GG", label: "Guernsey" },
  { value: "GN", label: "Guinea" },
  { value: "GW", label: "Guinea-Bissau" },
  { value: "GY", label: "Guyana" },
  { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" },
  { value: "HK", label: "Hong Kong" },
  { value: "HU", label: "Hungary" },
  { value: "IS", label: "Iceland" },
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" },
  { value: "IE", label: "Ireland" },
  { value: "IM", label: "Isle of Man" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" },
  { value: "CI", label: "Ivory Coast" },
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japan" },
  { value: "JE", label: "Jersey" },
  { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "KE", label: "Kenya" },
  { value: "KI", label: "Kiribati" },
  { value: "XK", label: "Kosovo" },
  { value: "KW", label: "Kuwait" },
  { value: "KG", label: "Kyrgyzstan" },
  { value: "LA", label: "Laos" },
  { value: "LV", label: "Latvia" },
  { value: "LB", label: "Lebanon" },
  { value: "LS", label: "Lesotho" },
  { value: "LR", label: "Liberia" },
  { value: "LY", label: "Libya" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  { value: "MO", label: "Macau" },
  { value: "MK", label: "Macedonia" },
  { value: "MG", label: "Madagascar" },
  { value: "MW", label: "Malawi" },
  { value: "MY", label: "Malaysia" },
  { value: "MV", label: "Maldives" },
  { value: "ML", label: "Mali" },
  { value: "MT", label: "Malta" },
  { value: "MH", label: "Marshall Islands" },
  { value: "MR", label: "Mauritania" },
  { value: "MU", label: "Mauritius" },
  { value: "YT", label: "Mayotte" },
  { value: "MX", label: "Mexico" },
  { value: "FM", label: "Micronesia" },
  { value: "MD", label: "Moldova" },
  { value: "MC", label: "Monaco" },
  { value: "MN", label: "Mongolia" },
  { value: "ME", label: "Montenegro" },
  { value: "MS", label: "Montserrat" },
  { value: "MA", label: "Morocco" },
  { value: "MZ", label: "Mozambique" },
  { value: "MM", label: "Myanmar" },
  { value: "NA", label: "Namibia" },
  { value: "NR", label: "Nauru" },
  { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" },
  { value: "NC", label: "New Caledonia" },
  { value: "NZ", label: "New Zealand" },
  { value: "NI", label: "Nicaragua" },
  { value: "NE", label: "Niger" },
  { value: "NG", label: "Nigeria" },
  { value: "NU", label: "Niue" },
  { value: "KP", label: "North Korea" },
  { value: "MP", label: "Northern Mariana Islands" },
  { value: "NO", label: "Norway" },
  { value: "OM", label: "Oman" },
  { value: "PK", label: "Pakistan" },
  { value: "PW", label: "Palau" },
  { value: "PS", label: "Palestine" },
  { value: "PA", label: "Panama" },
  { value: "PG", label: "Papua New Guinea" },
  { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Peru" },
  { value: "PH", label: "Philippines" },
  { value: "PN", label: "Pitcairn Islands" },
  { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" },
  { value: "PR", label: "Puerto Rico" },
  { value: "QA", label: "Qatar" },
  { value: "CG", label: "Republic of the Congo" },
  { value: "RE", label: "Reunion" },
  { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" },
  { value: "RW", label: "Rwanda" },
  { value: "BL", label: "Saint Barthelemy" },
  { value: "SH", label: "Saint Helena" },
  { value: "KN", label: "Saint Kitts and Nevis" },
  { value: "LC", label: "Saint Lucia" },
  { value: "MF", label: "Saint Martin" },
  { value: "PM", label: "Saint Pierre and Miquelon" },
  { value: "VC", label: "Saint Vincent and the Grenadines" },
  { value: "WS", label: "Samoa" },
  { value: "SM", label: "San Marino" },
  { value: "ST", label: "Sao Tome and Principe" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "SN", label: "Senegal" },
  { value: "RS", label: "Serbia" },
  { value: "SC", label: "Seychelles" },
  { value: "SL", label: "Sierra Leone" },
  { value: "SG", label: "Singapore" },
  { value: "SX", label: "Sint Maarten" },
  { value: "SK", label: "Slovakia" },
  { value: "SI", label: "Slovenia" },
  { value: "SB", label: "Solomon Islands" },
  { value: "SO", label: "Somalia" },
  { value: "ZA", label: "South Africa" },
  { value: "KR", label: "South Korea" },
  { value: "SS", label: "South Sudan" },
  { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" },
  { value: "SD", label: "Sudan" },
  { value: "SR", label: "Suriname" },
  { value: "SJ", label: "Svalbard and Jan Mayen" },
  { value: "SZ", label: "Swaziland" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "SY", label: "Syria" },
  { value: "TW", label: "Taiwan" },
  { value: "TJ", label: "Tajikistan" },
  { value: "TZ", label: "Tanzania" },
  { value: "TH", label: "Thailand" },
  { value: "TG", label: "Togo" },
  { value: "TK", label: "Tokelau" },
  { value: "TO", label: "Tonga" },
  { value: "TT", label: "Trinidad and Tobago" },
  { value: "TN", label: "Tunisia" },
  { value: "TR", label: "Turkey" },
  { value: "TM", label: "Turkmenistan" },
  { value: "TC", label: "Turks and Caicos Islands" },
  { value: "TV", label: "Tuvalu" },
  { value: "UG", label: "Uganda" },
  { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "VU", label: "Vanuatu" },
  { value: "VA", label: "Vatican" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Vietnam" },
  { value: "VI", label: "Virgin Islands, U.S." },
  { value: "EH", label: "Western Sahara" },
  { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" }
];

export const getQuestions = async (university: string, courses: string[]): Promise<Question[]> => {

  return [
    {
      id: 'diet',
      type: 'single',
      question: '1. Would you describe your current diet as healthy and balanced?',
      options: ['Healthy', 'Unhealthy', 'Somewhat Inbetween']
    },
    {
      id: 'ethnic_group',
      type: 'single',
      question: '2. What is your ethnic group?',
      options: ['Asian', 'Black', 'Mixed', 'White', 'Arab', 'Other']
    },
    {
      id: 'hours_per_week_university_work',
      type: 'slider',
      question: '3. How many hours do you spend on university/academic-related work, separate from your Course Timetable, per week during exams?',
      min: 0,
      max: 50,
      step: 1,
      showAboveMax: true
    },
    {
      id: 'family_earning_class',
      type: 'single',
      question: '4. How would you rate your family class? (family earnings per year)',
      options: ['Lower Class (below £25,000)', 'Middle Class (£25,000-£54,999)', 
                'Higher Class (£55,000-£90,000)', 'Upper Higher Class (above £90,000)']
    },
    {
      id: 'quality_of_life',
      type: 'single',
      question: '5. How would you define your quality of life? (as defined by the World Health Organization)',
      options: ['Very Low', 'Low', 'Medium', 'High', 'Very High']
    },
    {
      id: 'alcohol_consumption',
      type: 'single',
      question: '6. How would you define your alcohol consumption?',
      options: ['No Drinks', 'Below Moderate', 'Moderate', 'Above Moderate']
    },
    {
      id: 'personality_type',
      type: 'single',
      question: '7. Would you consider yourself an introvert or extrovert person? (Definitions from Oxford Languages)',
      options: ['Introvert', 'Extrovert', 'Somewhat in-between']
    },
    {
      id: 'stress_in_general',
      type: 'multi',
      question: '8. In general, do you feel you experience stress while in the University/Academic Studies? (tick all that apply)',
      options: [
        'Yes (due to university work)',
        'Yes (due to employment-related issues)',
        'Yes (due to other circumstances, such as health, family issues, etc)',
        'No'
      ]},
    {
      id: 'well_hydrated',
      type: 'single',
      question: '9. Would you say that you are normally well hydrated?',
      options: ['Yes', 'No', 'Sometimes']
    },
    {
      id: 'exercise_per_week',
      type: 'slider',
      question: '10. How often do you exercise per week?',
      min: 0,
      max: 7,
      step: 1,
      showAboveMax: true
    },
    {
      id: 'known_disabilities',
      type: 'single',
      question: '11. Do you have any known disabilities?',
      options: ['Yes', 'No', 'Prefer not to say']
    },
    {
      id: 'work_hours_per_week',
      type: 'slider',
      question: '12. How many hours per week do you work?',
      min: 0,
      max: 40,
      step: 1,
      showAboveMax: true
    },
    {
      id: 'financial_support',
      type: 'single',
      question: '13. What is your main financial support for your studies?',
      options: ['Degree Apprentice', 'Parent (family) support', 'Scholarship', 'Self-paid', 'Siblings', 'Sponsorship (Company/Organisation etc)', 'Student loan']
    },
    {
      id: 'form_of_employment',
      type: 'single',
      question: '14. Are you in any form of employment?',
      options: ['Full-time', 'Part-time', 'Not employed', 'Self-employed']
    },
    {
      id: 'financial_problems',
      type: 'single',
      question: '15. Do you normally encounter financial issues paying your fees?',
      options: ['Yes', 'No']
    },
    {
      id: 'home_country',
      type: 'dropdown',
      question: '16. What Country are you from?',
      options: countries.map(country => country.label)
    },
    {
      id: 'age',
      type: 'slider',
      question: '17. What is your year of birth?',
      min: 1970,
      max: 2010,
      step: 1,
      showAboveMax: true
    },
    {
      id: 'course_of_study',
      type: 'dropdown',
      question: '18. What is your course of study?',
      options: courses
    },
    {
      id: 'stress_before_exams',
      type: 'single',
      question: '19. Do you normally feel stressed before exams?',
      options: ['Yes', 'No', "I don't have exams"]
    },
    {
      id: 'feel_afraid',
      type: 'single',
      question: '20. How often in the last week or two did you feel afraid that something awful might happen?',
      options: ['Never','Very Rarely' , 'Rarely', 'Occasionally', 'Frequently','Very Frequently' ]
    },
    {
      id: 'timetable_preference',
      type: 'single',
      question: '21. If your Course has less than 24 hours on Timetable, would you prefer your timetable to be spread (3-4 days with fewer lectures) or compact (1-2 busy days) so you have less stress at university? (eg, 1-2 busy days or 3-4 days with less lectures)',
      options: ['Spread', 'Compact']
    },
    {
      id: 'timetable_reasons',
      type: 'text',
      question: '22. What are the reasons for your timetable preference?'
    },
    {
      id: 'timetable_impact',
      type: 'single',
      question: '23. Do you feel your timetabling structure has any impact on your study, life and health?',
      options: [ 'No','Yes', 'Yes, on my studies', 'Yes, on my life and health', 'Yes, on my life, health and studies']
    },
    {
      id: 'total_device_hours',
      type: 'slider',
      question: '24. How many hours do you spend using technology devices per day (mobile, desktop, laptops, etc)?',
      min: 0,
      max: 24,
      step: 1,
      showAboveMax: true
    },
    {
      id: 'hours_socialmedia',
      type: 'slider',
      question: '25. How many hours do you spend using social media per day (Instagram, Tiktok, Twitter, etc)?',
      min: 0,
      max: 24,
      step: 1,
      showAboveMax: true
    },
    {
      id: 'level_of_study',
      type: 'single',
      question: '26. What year of study are you in?',
      options: ['Level 4 (first year, undergraduate)', 'Level 5 (second year, undergraduate)', 'Level 6 (third year, undergraduate)', 'Level 7 (postgraduate)', 'Other']
    },
    {
      id: 'gender',
      type: 'single',
      question: '27. How would you describe your biological gender?',
      options: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    {
      id: 'physical_activities',
      type: 'single',
      question: '28. Do you consider physical activity to be helpful to your mental health?',
      options: ['Yes', 'No', 'Not sure']
    },
    {
      id: 'hours_between_lectures',
      type: 'slider',
      question: '29. How many hours do you normally have BETWEEN lectures per day?',
      min: 0,
      max: 12,
      step: 1,
      showAboveMax: true
    },
    {
      id: 'hours_per_week_lectures',
      type: 'slider',
      question: '30. How many hours per week do you have active lectures? (Active means attending lectures)',
      min: 0,
      max: 40,
      step: 1,
      showAboveMax: true
    },
    {
      id: 'hours_socialising',
      type: 'slider',
      question: '31. How many hours per week do you socialise? (Meeting other people, participating in social activities etc).',
      min: 0,
      max: 40,
      step: 1,
      showAboveMax: true
    },
    {
      id: 'actual',
      type: 'single',
      question: '32. Would you classify yourself or have you been diagnosed with mental health issues by a professional?',
      options: ['Yes', 'No', "Prefer not to say / I don't know"]
    },
    {
      id: 'student_type_time',
      type: 'single',
      question: '33. Are you full-time or part-time student?',
      options: ['Full-time', 'Part-time', 'Don’t know']
    },
    {
      id: 'student_type_location',
      type: 'single',
      question: '34. Are you a home student or an international student?',
      options: ['Home student', 'International student', 'European student']
    },
    {
      id: 'cost_of_study',
      type: 'slider',
      question: '35. What are the approximate costs for your studies? (tuition fee per year of study, in pound sterling £)',
      min: 0,
      max: 50000,
      step: 1000,
      showAboveMax: true
    },
    {
      id: 'sense_of_belonging',
      type: 'single',
      question: `36. Do you feel a sense of "belonging" at ${university.toUpperCase()}?`,
      options: ['A little', "Don't know", 'Very much']
    },
    {
      id: 'mental_health_activities',
      type: 'text',
      question: '37. Please let us know about any activities that could support your mental health that you would be interested in. (e.g., physical activities, sports, mindfulness, book clubs, arts/craft activities etc)'
    }
  ];
};

