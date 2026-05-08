import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Необходимо войти в аккаунт');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/orders/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (err) {
      setError('Ошибка при загрузке заказов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/orders/${orderId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrder(response.data);
      setShowDetails(true);
    } catch (err) {
      console.error('Ошибка загрузки деталей заказа:', err);
    }
  };

  const clearAllOrders = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить ВСЮ историю заказов? Это действие нельзя отменить.')) {
      return;
    }

    setClearing(true);
    const token = localStorage.getItem('access_token');
    
    try {
      await axios.delete('http://127.0.0.1:8000/api/orders/clear_all/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders([]);
      alert('История заказов очищена');
    } catch (err) {
      setError('Ошибка при очистке заказов');
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    const statuses = {
      'new': '🆕 Новый',
      'processing': '⚙️ В обработке',
      'paid': '💳 Оплачен',
      'shipped': '🚚 Отправлен',
      'delivered': '📦 Доставлен',
      'cancelled': '❌ Отменён'
    };
    return statuses[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      'cash': '💵 Наличными при получении',
      'card': '💳 Банковской картой онлайн',
      'erip': '🏦 ЕРИП'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Загрузка заказов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-error">
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Войти</button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Мои заказы</h1>
        {orders.length > 0 && (
          <button 
            className="clear-all-btn" 
            onClick={clearAllOrders}
            disabled={clearing}
          >
            {clearing ? 'Очистка...' : '🗑️ Очистить историю'}
          </button>
        )}
      </div>
      
      {orders.length === 0 ? (
        <div className="orders-empty">
          <h2>У вас пока нет заказов</h2>
          <p>Перейдите в каталог, чтобы сделать первый заказ</p>
          <button onClick={() => navigate('/catalog')}>Перейти в каталог</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>Заказ №{order.id}</strong>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                </div>
                <div className="order-status">{getStatusText(order.status)}</div>
              </div>
              
              <div className="order-info">
                <div className="order-address">
                  <strong>Адрес доставки:</strong>
                  <p>
                    {order.city}, {order.street}, д.{order.house}
                    {order.apartment && `, кв.${order.apartment}`}
                  </p>
                </div>
                <div className="order-contacts">
                  <strong>Получатель:</strong>
                  <p>{order.first_name} {order.last_name}</p>
                  <p>{order.phone}</p>
                  <p>{order.email}</p>
                </div>
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  <strong>Итого:</strong> {order.total_price} BYN
                </div>
                <button 
                  className="details-btn"
                  onClick={() => fetchOrderDetails(order.id)}
                >
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Заказ №{selectedOrder.id}</h2>
              <button className="close-btn" onClick={() => setShowDetails(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Информация о заказе</h3>
                <p><strong>Дата:</strong> {formatDate(selectedOrder.created_at)}</p>
                <p><strong>Статус:</strong> {getStatusText(selectedOrder.status)}</p>
              </div>

              <div className="detail-section">
                <h3>Оплата</h3>
                <p><strong>Способ оплаты:</strong> {getPaymentMethodText(selectedOrder.payment_method)}</p>
                <p><strong>Статус оплаты:</strong> {selectedOrder.paid ? '✅ Оплачен' : '⏳ Ожидает оплаты'}</p>
                {selectedOrder.payment_id && (
                  <p><strong>ID платежа:</strong> {selectedOrder.payment_id}</p>
                )}
              </div>

              <div className="detail-section">
                <h3>Данные получателя</h3>
                <p><strong>Имя:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                <p><strong>Телефон:</strong> {selectedOrder.phone}</p>
                <p><strong>Адрес:</strong> {selectedOrder.city}, {selectedOrder.street}, д.{selectedOrder.house}</p>
                {selectedOrder.apartment && <p><strong>Квартира:</strong> {selectedOrder.apartment}</p>}
              </div>

              <div className="detail-section">
                <h3>Состав заказа</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Товар</th>
                        <th>Цена</th>
                        <th>Кол-во</th>
                        <th>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map(item => (
                        <tr key={item.id}>
                          <td>{item.part_name}</td>
                          <td>{item.part_price} BYN</td>
                          <td>{item.quantity}</td>
                          <td>{item.price} BYN</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="total-row">
                        <td colSpan="3"><strong>Итого:</strong></td>
                        <td><strong>{selectedOrder.total_price} BYN</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p>Нет информации о товарах</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;