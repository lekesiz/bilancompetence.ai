import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import api from '../lib/api';

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'text' | 'rating' | 'open_ended';
  options?: string[];
  correct_answer?: string;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed';
  assessment_type: string;
  questions?: Question[];
}

interface Answer {
  questionId: string;
  answer: string | number;
}

export default function AssessmentDetailScreen({ route, navigation }: any) {
  const { assessmentId } = route.params;
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadAssessmentDetail();
  }, []);

  const loadAssessmentDetail = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAssessment(assessmentId);
      if (response.data?.data) {
        setAssessment(response.data.data);

        // Load questions
        const questionsResponse = await api.get(
          `/assessments/${assessmentId}/questions`
        );
        if (questionsResponse.data?.data) {
          setQuestions(questionsResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load assessment:', error);
      Alert.alert('Error', 'Failed to load assessment');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, { questionId, answer });
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    if (answers.size < questions.length) {
      Alert.alert(
        'Incomplete Assessment',
        'Please answer all questions before submitting'
      );
      return;
    }

    Alert.alert(
      'Submit Assessment',
      'Are you sure you want to submit? You cannot change your answers after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              // Submit all answers
              for (const [, answer] of answers) {
                await api.post(`/assessments/${assessmentId}/answers`, {
                  question_id: answer.questionId,
                  answer: answer.answer.toString(),
                });
              }

              // Complete assessment
              await api.completeAssessment(assessmentId);

              setShowResults(true);
              Alert.alert('Success', 'Assessment submitted successfully!');
            } catch (error) {
              console.error('Failed to submit assessment:', error);
              Alert.alert('Error', 'Failed to submit assessment');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No questions found</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isAnswered = answers.has(currentQuestion.id);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{assessment.title}</Text>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{Math.round(progress)}% Complete</Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>

          {/* Answer Section based on type */}
          {currentQuestion.question_type === 'multiple_choice' && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    answers.get(currentQuestion.id)?.answer === option &&
                      styles.optionSelected,
                  ]}
                  onPress={() => handleAnswerChange(currentQuestion.id, option)}
                >
                  <View
                    style={[
                      styles.optionRadio,
                      answers.get(currentQuestion.id)?.answer === option &&
                        styles.optionRadioSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      answers.get(currentQuestion.id)?.answer === option &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentQuestion.question_type === 'rating' && (
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    answers.get(currentQuestion.id)?.answer === rating &&
                      styles.ratingOptionSelected,
                  ]}
                  onPress={() => handleAnswerChange(currentQuestion.id, rating)}
                >
                  <Text
                    style={[
                      styles.ratingText,
                      answers.get(currentQuestion.id)?.answer === rating &&
                        styles.ratingTextSelected,
                    ]}
                  >
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {(currentQuestion.question_type === 'text' ||
            currentQuestion.question_type === 'open_ended') && (
            <TextInput
              style={styles.textInput}
              placeholder="Enter your answer here"
              placeholderTextColor="#999"
              value={
                (answers.get(currentQuestion.id)?.answer as string) || ''
              }
              onChangeText={(text) =>
                handleAnswerChange(currentQuestion.id, text)
              }
              multiline
              numberOfLines={4}
            />
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.navigationButton,
              currentQuestionIndex === 0 && styles.buttonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <Text
              style={[
                styles.navigationButtonText,
                currentQuestionIndex === 0 && styles.navigationButtonTextDisabled,
              ]}
            >
              ← Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navigationButton,
              currentQuestionIndex === questions.length - 1 &&
                styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            <Text
              style={[
                styles.navigationButtonText,
                currentQuestionIndex === questions.length - 1 &&
                  styles.navigationButtonTextDisabled,
              ]}
            >
              Next →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        {currentQuestionIndex === questions.length - 1 && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitAssessment}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                Submit Assessment ✓
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Answer Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Answers</Text>
          <View style={styles.answeredCount}>
            <Text style={styles.answeredCountText}>
              {answers.size} of {questions.length} answered
            </Text>
            <View style={styles.progressIndicatorSmall}>
              <View
                style={[
                  styles.progressIndicatorFill,
                  { width: `${(answers.size / questions.length) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Results Modal */}
      <Modal visible={showResults} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.resultsModal}>
            <Text style={styles.resultsTitle}>Assessment Complete! 🎉</Text>
            <Text style={styles.resultsMessage}>
              Thank you for completing the assessment. Your answers have been
              recorded and will be analyzed.
            </Text>
            <TouchableOpacity
              style={styles.resultsButton}
              onPress={() => {
                setShowResults(false);
                navigation.navigate('Assessments');
              }}
            >
              <Text style={styles.resultsButtonText}>View Assessments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  progressIndicator: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  optionSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#2563eb',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginRight: 12,
  },
  optionRadioSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#2563eb',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  ratingOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f9ff',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  ratingTextSelected: {
    color: '#2563eb',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  navigationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
  },
  navigationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  navigationButtonTextDisabled: {
    color: '#ccc',
  },
  buttonDisabled: {
    borderColor: '#e5e7eb',
    opacity: 0.5,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  answeredCount: {
    gap: 8,
  },
  answeredCountText: {
    fontSize: 14,
    color: '#666',
  },
  progressIndicatorSmall: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressIndicatorFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    width: '80%',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 12,
  },
  resultsMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  resultsButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  resultsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
