import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Filters.css';

function Filters({ category, onFilterChange }) {
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        setLoading(true);
        let url = `http://127.0.0.1:8000/api/parts/?category=${category}&page_size=100`;
        const response = await axios.get(url);
        
        let partsList = [];
        if (response.data.results) {
          partsList = response.data.results;
        } else if (Array.isArray(response.data)) {
          partsList = response.data;
        }
        
        const uniqueManufacturers = [...new Set(partsList.map(p => p.manufacturer).filter(Boolean))];
        setManufacturers(uniqueManufacturers.sort());
      } catch (error) {
        console.error('Ошибка загрузки производителей:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchManufacturers();
  }, [category]);

  const toggleManufacturer = (manufacturer) => {
    let newSelection;
    if (selectedManufacturers.includes(manufacturer)) {
      newSelection = selectedManufacturers.filter(m => m !== manufacturer);
    } else {
      newSelection = [...selectedManufacturers, manufacturer];
    }
    setSelectedManufacturers(newSelection);
    onFilterChange({ manufacturers: newSelection });
  };

  const clearFilters = () => {
    setSelectedManufacturers([]);
    onFilterChange({ manufacturers: [] });
  };

  if (loading) {
    return (
      <div className="filters">
        <div className="filters-header">
          <h3>Фильтры</h3>
        </div>
        <div className="filter-loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="filters">
      <div className="filters-header">
        <h3>Фильтры</h3>
        <button className="clear-filters-btn" onClick={clearFilters}>
          Сбросить
        </button>
      </div>

      <div className="filter-section">
        <h4>Производитель</h4>
        {manufacturers.length === 0 ? (
          <p className="filter-loading">Нет производителей</p>
        ) : (
          <div className="manufacturers-list">
            {manufacturers.map(manufacturer => (
              <label key={manufacturer} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedManufacturers.includes(manufacturer)}
                  onChange={() => toggleManufacturer(manufacturer)}
                />
                <span>{manufacturer}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Filters;