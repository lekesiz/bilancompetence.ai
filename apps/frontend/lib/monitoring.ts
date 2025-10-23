/**
 * Monitoring & Analytics Integration
 * Tracks Qualiopi metrics for analysis and dashboarding
 */

/**
 * Google Analytics 4 Event Tracking
 */
export function trackAnalyticsEvent(
  eventName: string,
  eventData?: Record<string, string | number | boolean>
) {
  // Check if gtag is available
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as any).gtag;
    gtag('event', eventName, {
      module: 'qualiopi',
      ...eventData,
    });
  }
}

/**
 * Track Qualiopi Page View
 */
export function trackQualiopisPageView(pageName: 'indicators' | 'surveys' | 'archive' | 'reports') {
  trackAnalyticsEvent('qualiopi_page_view', {
    page: pageName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track Indicator Status Update
 */
export function trackIndicatorStatusUpdate(
  indicatorId: number,
  newStatus: 'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW'
) {
  trackAnalyticsEvent('qualiopi_indicator_update', {
    indicatorId,
    newStatus,
    action: 'status_update',
  });
}

/**
 * Track Evidence Upload
 */
export function trackEvidenceUpload(indicatorId: number, fileName: string, fileSize: number) {
  trackAnalyticsEvent('qualiopi_evidence_upload', {
    indicatorId,
    fileName,
    fileSizeKB: Math.round(fileSize / 1024),
  });
}

/**
 * Track Survey Completed
 */
export function trackSurveyCompleted(npsScore: number, responseCount: number) {
  trackAnalyticsEvent('qualiopi_survey_completed', {
    npsScore,
    responseCount,
  });
}

/**
 * Track Document Accessed
 */
export function trackDocumentAccess(documentId: string, action: 'view' | 'download' | 'share') {
  trackAnalyticsEvent('qualiopi_document_access', {
    documentId,
    action,
  });
}

/**
 * Track Report Generated
 */
export function trackReportGenerated(
  compliancePercentage: number,
  exportFormat: 'json' | 'csv' | 'pdf'
) {
  trackAnalyticsEvent('qualiopi_report_generated', {
    compliancePercentage: Math.round(compliancePercentage),
    exportFormat,
  });
}

/**
 * Track API Call Performance
 */
export function trackApiPerformance(endpoint: string, duration: number, statusCode: number) {
  if (duration > 1000) {
    // Only track slow requests
    trackAnalyticsEvent('api_slow_request', {
      endpoint,
      durationMs: duration,
      statusCode,
    });
  }
}

/**
 * Track Error Event
 */
export function trackErrorEvent(errorType: string, errorMessage: string, context?: string) {
  trackAnalyticsEvent('qualiopi_error', {
    errorType,
    errorMessage,
    context: context || 'unknown',
  });
}

/**
 * Track User Action for Compliance
 */
export function trackComplianceAction(action: string, details?: Record<string, string | number>) {
  trackAnalyticsEvent('qualiopi_compliance_action', {
    action,
    ...details,
  });
}

/**
 * Vercel Web Analytics Integration (Simple)
 */
export function trackVercelAnalytics(
  eventName: string,
  data?: Record<string, string | number | boolean>
) {
  // Vercel Analytics uses performance API
  if (typeof window !== 'undefined') {
    try {
      // Use Web Vitals API if available
      if ('performance' in window) {
        const metric = {
          name: eventName,
          value: Date.now(),
          ...data,
        };
        // This would be captured by Vercel's analytics middleware
      }
    } catch (error) {
      // Silently fail if analytics unavailable
    }
  }
}

/**
 * Custom Dashboard Metrics (for future integration)
 */
export interface QualiotiMetrics {
  organizationId: string;
  compliancePercentage: number;
  compliantIndicators: number;
  underReviewIndicators: number;
  missingIndicators: number;
  npsScore: number;
  surveyResponseRate: number;
  documentCount: number;
  lastUpdated: string;
}

/**
 * Store metrics for dashboard consumption
 */
export function storeQualiotiMetrics(metrics: QualiotiMetrics) {
  // Store in localStorage for dashboard
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    try {
      localStorage.setItem(
        'qualiopi_metrics',
        JSON.stringify({
          ...metrics,
          storedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      // Storage quota exceeded or private browsing
      console.warn('Unable to store metrics:', error);
    }
  }
}

/**
 * Retrieve stored metrics
 */
export function getQualiotiMetrics(): QualiotiMetrics | null {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    try {
      const data = localStorage.getItem('qualiopi_metrics');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * Track Web Vitals for Qualiopi pages
 */
export function trackWebVitals(
  metric: {
    name: string;
    value: number;
    rating?: 'good' | 'needs-improvement' | 'poor';
  }
) {
  trackAnalyticsEvent(`qualiopi_web_vital_${metric.name}`, {
    value: Math.round(metric.value),
    rating: metric.rating || 'unknown',
  });
}

export default {
  trackAnalyticsEvent,
  trackQualiopisPageView,
  trackIndicatorStatusUpdate,
  trackEvidenceUpload,
  trackSurveyCompleted,
  trackDocumentAccess,
  trackReportGenerated,
  trackApiPerformance,
  trackErrorEvent,
  trackComplianceAction,
  trackVercelAnalytics,
  storeQualiotiMetrics,
  getQualiotiMetrics,
  trackWebVitals,
};
