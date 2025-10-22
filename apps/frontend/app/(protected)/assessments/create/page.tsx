'use client';

import { useRouter } from 'next/navigation';
import { useAssessmentWizard } from '@/hooks/useAssessmentWizard';
import { AssessmentWizard } from '@/components/assessment/AssessmentWizard';
import { useState } from 'react';

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [assessmentCreated, setAssessmentCreated] = useState<string | null>(null);

  const handleWizardComplete = (assessmentId: string) => {
    // Redirect to success page or assessments list
    router.push(`/assessments/${assessmentId}`);
  };

  return (
    <main>
      <AssessmentWizard
        initialStep={1}
        onComplete={handleWizardComplete}
      />
    </main>
  );
}
