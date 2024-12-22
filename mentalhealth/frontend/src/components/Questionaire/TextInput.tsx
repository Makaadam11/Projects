import { ChangeEvent, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
`;

const QuestionText = styled.h2`
  font-size: 16px;
  color: #333333;
  font-weight: 500;
`;

const TextAreaWrapper = styled.div`
  width: 100%;
  background-color: rgb(240, 240, 240);
  border: 1px solid rgb(204, 204, 204);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgb(230, 230, 230);
  }

  &:focus-within {
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  background-color: white;
  border: none;
  border-radius: 4px;
  padding: 12px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;

  &:focus {
    outline: none;
  }
`;

interface TextInputProps {
  question: string;
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
}

export const TextInput = ({ 
  question, 
  value, 
  onValueChange, 
  id = 'text-input' 
}: TextInputProps) => {
  const [hasSpellingError, setHasSpellingError] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange(e.target.value);
    setHasSpellingError(!e.target.checkValidity());
  };

  return (
    <div className="space-y-4">
      <h2 className="text-[#333333] text-lg font-medium">{question}</h2>
      <div className="relative pt-1">
        <TextAreaWrapper>
          <StyledTextArea
            id={id}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="w-full"
          />
        </TextAreaWrapper>
      </div>
    </div>
  );
};