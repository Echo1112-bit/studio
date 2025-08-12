import type { Coach, CoachId } from './types';

export const coaches: Record<CoachId, Coach> = {
  'dr-chen': {
    id: 'dr-chen',
    name: 'Dr. Chen',
    title: 'Rational Analyst',
    emoji: '🧠',
    quote: "Let's solve this step by step with data and logic.",
    perfectFor: 'Analytical thinkers',
    colors: {
      primary: '#1e3a8a',
      primaryHsl: '223 64% 32%',
    },
    serviceEmoji: '🔬',
    examples: ['Analyze Q3 sales data', 'Research competitor pricing'],
    celebrations: {
      step: ['Excellent progress.', 'Logically sound.', 'Optimal execution.'],
      final: 'Conclusion: Success. Your systematic approach has yielded the desired outcome. This achievement has been logged for future performance analysis.',
    },
  },
  luna: {
    id: 'luna',
    name: 'Luna',
    title: 'Gentle Supporter',
    emoji: '💖',
    quote: "We'll take it slow together, no pressure at all.",
    perfectFor: 'Need encouragement',
    colors: {
      primary: '#f43f5e',
      primaryHsl: '350 89% 60%',
    },
    serviceEmoji: '☕',
    examples: ['Write a simple email', 'Organize one drawer'],
    celebrations: {
      step: ["You're doing wonderfully!", "One step at a time.", "We're in this together."],
      final: "We did it! I'm so incredibly proud of you for seeing this through. Remember to be kind to yourself and celebrate this wonderful achievement. You deserve it.",
    },
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    title: 'Action Coach',
    emoji: '⚡',
    quote: 'Stop thinking, start doing RIGHT NOW!',
    perfectFor: 'Need motivation',
    colors: {
      primary: '#dc2626',
      primaryHsl: '0 72% 51%',
    },
    serviceEmoji: '🏆',
    examples: ['Send those 3 important emails', 'Make that phone call'],
    celebrations: {
      step: ['Boom! Next!', 'Momentum is key!', 'Keep pushing!'],
      final: "VICTORY! That's how it's done! You faced the challenge head-on and crushed it. No excuses, just results. Take a moment to feel that power, then let's find the next target.",
    },
  },
  zoe: {
    id: 'zoe',
    name: 'Zoe',
    title: 'Fun Motivator',
    emoji: '😄',
    quote: "Let's make this super fun and totally stress-free!",
    perfectFor: 'Want it fun',
    colors: {
      primary: '#facc15',
      primaryHsl: '45 96% 52%',
    },
    serviceEmoji: '🎉',
    examples: ['Defeat the Email Monster 📧', 'Conquer Mount Laundry 🏔️'],
    celebrations: {
      step: ['Level up!', 'Side quest complete!', 'Power-up!'],
      final: 'QUEST COMPLETE! You are officially a legend! High-five! You totally rocked it. Time for a victory dance and maybe some confetti. What adventure should we go on next?',
    },
  },
};

export const coachList = Object.values(coaches);
