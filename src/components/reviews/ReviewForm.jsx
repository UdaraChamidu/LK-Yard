import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ReviewForm({ targetId, targetType, targetName, onSuccess }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {}
    };
    checkAuth();
  }, []);

  const submitReview = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${targetType}-reviews`, targetId] });
      setRating(0);
      setReviewText('');
      if (onSuccess) onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    if (rating === 0) return;

    submitReview.mutate({
      target_id: targetId,
      target_type: targetType,
      target_name: targetName,
      reviewer_email: user.email,
      reviewer_name: user.full_name,
      rating,
      text: reviewText,
      moderated: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-[#111111] mb-4">Leave a Review</h3>
      
      <div className="mb-4">
        <label className="block text-sm text-[#616367] mb-2">Your Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-[#616367] mb-2">Your Review</label>
        <Textarea
          placeholder="Share your experience..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={rating === 0 || submitReview.isPending}
        className="bg-[#F47524] hover:bg-[#E06418]"
      >
        {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
      </Button>

      {submitReview.isSuccess && (
        <p className="text-sm text-green-600 mt-2">
          Review submitted! It will be visible after admin approval.
        </p>
      )}
    </form>
  );
}