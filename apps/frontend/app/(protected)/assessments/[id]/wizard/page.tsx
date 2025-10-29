'use client';

export const dynamic = 'force-dynamic';


import { useRouter, useParams } from 'next/navigation';
import { AssessmentWizard } from '@/components/assessment/AssessmentWizard';

export default function AssessmentWizardPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const handleWizardComplete = (completedId: string) => {
    // Redirect to review page
    router.push(`/assessments/${completedId}`);
  };

  return (
    <main>
      <AssessmentWizard
        assessmentId={assessmentId}
        onComplete={handleWizardComplete}
      />
    </main>
  );
}
