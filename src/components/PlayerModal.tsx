import React, { type FormEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';
import type { MultiValue } from 'react-select';
import type { PlayerFormData } from '../types/player';

interface Props {
  show: boolean;
  formData: PlayerFormData;
  onChange: (data: PlayerFormData) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
  title: string;
  availableTags: string[];
}

export const PlayerModal: React.FC<Props> = ({
  show,
  formData,
  onChange,
  onSubmit,
  onClose,
  title,
  availableTags,
}) => {
  const tagOptions = availableTags.map((tag) => ({ value: tag, label: tag }));

  const handleSelectChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    const tags = newValue.map((opt) => opt.value);
    // reset ratings for removed tags
    const updatedRatings = formData.tagRatings || {};
    Object.keys(updatedRatings).forEach((key) => {
      if (!tags.includes(key)) delete updatedRatings[key];
    });
    onChange({ ...formData, tags, tagRatings: updatedRatings });
  };

  const handleCreateOption = (inputValue: string) => {
    const newTag = inputValue.trim();
    if (!newTag || formData.tags.includes(newTag)) return;
    onChange({
      ...formData,
      tags: [...formData.tags, newTag],
      tagRatings: { ...(formData.tagRatings || {}) },
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Имя</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Ник <span className="text-secondary">(опционально)</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.nickname}
              onChange={(e) => onChange({ ...formData, nickname: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Рейтинг</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={100}
              value={formData.rating}
              onChange={(e) =>
                onChange({
                  ...formData,
                  rating: e.target.value ? Number(e.target.value) : '',
                })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Теги</Form.Label>
            <CreatableSelect
              formatCreateLabel={(inputValue) => `Создать тег "${inputValue}"`}
              noOptionsMessage={() => 'Нет доступных тегов'}
              value={formData.tags.map((tag) => ({ value: tag, label: tag }))}
              isMulti
              options={tagOptions}
              onChange={handleSelectChange}
              onCreateOption={handleCreateOption}
              placeholder="Выберите или создайте тег..."
            />
          </Form.Group>

          {/* Дополнительные поля для рейтинга по тегам */}
          {formData.tags.length > 0 &&
            formData.tags.map((tag) => (
              <Form.Group className="mb-3" key={tag}>
                <Form.Label>
                  Рейтинг ({tag}) <span className="text-secondary">(опционально)</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={100}
                  value={formData.tagRatings?.[tag] ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...formData,
                      tagRatings: {
                        ...(formData.tagRatings || {}),
                        [tag]: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </Form.Group>
            ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            {title}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
