import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reviews.css';

function Reviews({ partId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    author: '',
    rating: 5,
    text: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Загрузка отзывов
  useEffect(() => {
    fetchReviews();
  }, [partId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/reviews/?part=${partId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Отправка нового отзыва
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.text.trim()) {
      alert('Пожалуйста, заполните имя и текст отзыва');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/reviews/', {
        part: partId,
        author: newReview.author,
        rating: newReview.rating,
        text: newReview.text
      });
      setNewReview({ author: '', rating: 5, text: '' });
      fetchReviews(); // перезагружаем список
      alert('Спасибо за отзыв!');
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка при отправке отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  // Рендер звёзд
  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div className="reviews-loading">Загрузка отзывов...</div>;
  }

  return (
    <div className="reviews">
      {/* Список отзывов */}
      <div className="reviews-list">
        <h3>Отзывы ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="no-reviews">Пока нет отзывов. Будьте первым!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <span className="review-author">{review.author}</span>
                <span className="review-rating">{renderStars(review.rating)}</span>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Форма добавления отзыва */}
      <div className="review-form">
        <h4>Оставить отзыв</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Ваше имя"
              value={newReview.author}
              onChange={(e) => setNewReview({...newReview, author: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
            >
              <option value="5">5 ★ - Отлично</option>
              <option value="4">4 ★ - Хорошо</option>
              <option value="3">3 ★ - Средне</option>
              <option value="2">2 ★ - Плохо</option>
              <option value="1">1 ★ - Ужасно</option>
            </select>
          </div>
          <div className="form-group">
            <textarea
              placeholder="Ваш отзыв..."
              value={newReview.text}
              onChange={(e) => setNewReview({...newReview, text: e.target.value})}
              rows={4}
              required
            />
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Отправка...' : 'Отправить отзыв'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Reviews;