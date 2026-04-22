"""
Загрузка тестовых данных в Django
Запускать из папки scripts с активированным venv Django
"""

import os
import sys
import json

# Добавляем путь к Django
sys.path.append(r'D:\Projects\autoparts-shop\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from parts.models import Part

def load_data():
    # Проверяем, существует ли файл
    if not os.path.exists('all_parts.json'):
        print("❌ Файл all_parts.json не найден!")
        print("   Сначала запусти: python create_test_data.py")
        return
    
    with open('all_parts.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    created = 0
    skipped = 0
    
    for category, parts in data.items():
        print(f"\n📂 Категория: {category}")
        for part_data in parts:
            # Проверяем, нет ли уже такой запчасти
            if Part.objects.filter(sku=part_data['sku']).exists():
                print(f"   ⏭️ Пропущено: {part_data['name']}")
                skipped += 1
                continue
            
            Part.objects.create(
                name=part_data['name'],
                category=part_data['category'],
                manufacturer=part_data['manufacturer'],
                sku=part_data['sku'],
                price=part_data['price'],
                stock=part_data['stock'],
                description=part_data['description'],
                compatibility=part_data.get('compatibility', '')
            )
            print(f"   ✅ Добавлено: {part_data['name']} — {part_data['price']} BYN")
            created += 1
    
    print("\n" + "=" * 50)
    print(f"📊 ИТОГ: создано {created}, пропущено {skipped}")
    print("=" * 50)

if __name__ == "__main__":
    load_data()