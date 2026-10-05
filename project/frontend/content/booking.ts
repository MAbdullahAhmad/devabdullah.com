export type CallTypeId = 'intro' | 'scoping' | 'consultation';

export interface CallType {
  id: CallTypeId;
  title: string;
  minutes: number;
  description: string;
}

export const booking = {
  timezone: 'UTC',
  utcOffsetMinutes: 0,
  cityLabel: 'UTC',
  weekdays: [1, 2, 3, 4, 5],
  startHour: 9,
  endHour: 17,
  stepMinutes: 30,
  daysAhead: 21,
  minNoticeHours: 12,
  callTypes: [
    {
      id: 'intro',
      title: 'Intro call',
      minutes: 15,
      description: 'A short introductory call request.',
    },
    {
      id: 'scoping',
      title: 'Project scoping',
      minutes: 30,
      description: 'A request to discuss project scope and requirements.',
    },
    {
      id: 'consultation',
      title: 'Technical consultation',
      minutes: 45,
      description: 'A request for a focused technical discussion.',
    },
  ] satisfies CallType[],
};
