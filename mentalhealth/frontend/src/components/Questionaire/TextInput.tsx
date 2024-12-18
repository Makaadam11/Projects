import { ChangeEvent, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  width: 973px;
`;

const QuestionText = styled.label`
  font-size: 16px;
  color: rgba(102, 102, 102, 1);
  width: 400px;
  height: 24px;
`;

const TextAreaWrapper = styled.div`
  width: 973px;
  min-height: 200px;
  background-color: rgba(242, 242, 242, 1);
  border: 1px solid rgba(204, 204, 204, 1);
  border-radius: 4px;
  padding: 10px;
`;

const StyledTextArea = styled.textarea`
  width: 950px;
  min-height: 180px;
  background-color: rgba(255, 255, 255, 1);
  border: none;
  resize: vertical;
  padding: 8px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.5;

  &:focus {
    outline: none;
  }

  &.spellcheck-error {
    text-decoration: underline wavy red;
  }
`;

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const TextInput = ({ value, onChange, id = 'timetable-preference' }: TextInputProps) => {
  const [hasSpellingError, setHasSpellingError] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Check for spelling errors using the browser's built-in spellcheck
    setHasSpellingError(!e.target.checkValidity());
  };

  return (
    <Container>
      <QuestionText htmlFor={id}>
        What are the reasons for your timetable preference?
      </QuestionText>
      <TextAreaWrapper>
        <StyledTextArea
          id={id}
          value={value}
          onChange={handleChange}
          spellCheck="true"
          className={hasSpellingError ? 'spellcheck-error' : ''}
          aria-label="Timetable preference reasons"
        />
      </TextAreaWrapper>
    </Container>
  );
};