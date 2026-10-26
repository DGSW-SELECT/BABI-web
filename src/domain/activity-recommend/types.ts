export interface Activity {
  id: number;
  icon: string;
  title: string;
  desc: string;
}

export interface Recommendation {
  ageLabel: string;
  condition: { feeding: string; sleep: string; temp: string; cry: string };
  comment: string;
  activities: Activity[];
}
