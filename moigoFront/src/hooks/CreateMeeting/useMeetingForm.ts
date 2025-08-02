import { useForm } from 'react-hook-form';

interface CreateMeetingForm {
  meetingName: string;
  maxPeople: number;
  description: string;
}

// 폼 관련 훅
export function useMeetingForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateMeetingForm>({
    defaultValues: {
      meetingName: '',
      maxPeople: 4,
      description: '',
    },
    mode: 'onChange',
  });

  // 유효성 검사 규칙 설정
  const validationRules = {
    meetingName: {
      required: '모임 이름을 입력해주세요',
      minLength: { value: 2, message: '모임 이름은 2자 이상 입력해주세요' },
      maxLength: { value: 50, message: '모임 이름은 50자 이하로 입력해주세요' },
    },
    maxPeople: {
      required: '최대 인원 수를 설정해주세요',
      min: { value: 1, message: '최소 1명 이상 설정해주세요' },
      max: { value: 50, message: '최대 50명까지 설정 가능합니다' },
    },
    description: {
      maxLength: { value: 300, message: '설명은 300자 이하로 입력해주세요' },
    },
  };

  // register 함수들
  const registerMeetingName = register('meetingName', validationRules.meetingName);
  const registerMaxPeople = register('maxPeople', validationRules.maxPeople);
  const registerDescription = register('description', validationRules.description);

  return {
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isValid,
    registerMeetingName,
    registerMaxPeople,
    registerDescription,
  };
}

export type { CreateMeetingForm };
